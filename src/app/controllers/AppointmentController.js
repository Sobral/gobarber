import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import { Op } from 'sequelize';
import ProviderController from './ProviderController';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

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

    return response.json(appointment);
  }

  async index(request, response) {
    const appointment = await Appointment.findAll({
      where: { user_id: request.UserID, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
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
}

export default new AppointmentController();
