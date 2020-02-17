import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import { Op } from 'sequelize';
import ProviderController from './ProviderController';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async store(request, response) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    const schemaValid = await schema.isValid(request.body);

    if (!schemaValid) {
      return response.status(401).json({ error: 'Input validation fails' });
    }

    const { provider_id, date } = request.body;
    const hourStart = startOfHour(parseISO(date));

    /**
     * Are You busy ??
     */
    const isUserBusy = await Appointment.findOne({
      where: { [Op.and]: [{ user_id: request.UserID }, { date }] },
    });

    if (isUserBusy) {
      return response
        .status(401)
        .json({ error: 'User already has a appointment in this date' });
    }

    /**
     * Check if provider exist
     */
    const existProvider = await ProviderController.providerExist(provider_id);

    if (!existProvider) {
      return response.status(401).json({ error: 'Provider ID does not exist' });
    }

    /**
     * Checks is provider is available in this date
     */

    if (isBefore(hourStart, new Date())) {
      return response.status(401).json({ error: 'Past date are now allowed.' });
    }

    const isProviderBusy = await Appointment.findOne({
      where: {
        [Op.and]: [{ provider_id }, { date: hourStart }, { canceled_at: null }],
      },
    });

    if (isProviderBusy) {
      return response
        .status(401)
        .json({ error: 'Provider is busy in this date' });
    }

    const appointment = await Appointment.create({
      provider_id,
      date: hourStart,
      user_id: request.UserID,
    });

    const user = await User.findOne({ where: { id: request.UserID } });

    const formatDate = format(
      hourStart,
      "'dia' dd 'de' MMMM 'de' Y 'às' H:mm",
      {
        locale: pt,
      }
    );
    await Notification.create({
      content: `Novo agendamento de ${user.name} no ${formatDate}`,
      user: provider_id,
    });

    return response.json(appointment);
  }

  async index(request, response) {
    const { page = 1 } = request.query;

    const appointment = await Appointment.findAll({
      where: { user_id: request.UserID, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],

          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return response.status(200).json(appointment);
  }

  async delete(request, response) {
    const { id } = request.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'provider', attributes: ['name', 'email'] },
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });

    if (!appointment) {
      return response
        .status(401)
        .json({ error: 'appointment does not exist!' });
    }

    const now = new Date();
    const appointmentHourSub = subHours(appointment.date, 2);
    const hourBeforeAppointment = isBefore(appointmentHourSub, now);

    const diffentUsers = appointment.user_id !== request.UserID;

    if (diffentUsers || hourBeforeAppointment) {
      return response.status(401).json({
        error: 'Not enought permission to cancel this appointment',
      });
    }

    appointment.canceled_at = now;
    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return response.json(appointment);
  }
}

export default new AppointmentController();
