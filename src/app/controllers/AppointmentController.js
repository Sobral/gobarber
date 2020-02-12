import * as Yup from 'yup';
import { Op } from 'sequelize';
import ProviderController from './ProviderController';
import Appointment from '../models/Appointment';

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

    /**
     * Are You busy ??
     */
    const isUserBusy = await Appointment.findOne({
      where: { [Op.and]: [{ user_id: request.UserID }, { date }] },
    });

    if (isUserBusy) {
      return response.status(401).json({ error: 'User is busy in this date' });
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
    const isProviderBusy = await Appointment.findOne({
      where: { [Op.and]: [{ provider_id }, { date }] },
    });

    if (isProviderBusy) {
      return response
        .status(401)
        .json({ error: 'Provider is busy in this date' });
    }

    const appointment = await Appointment.create({
      provider_id,
      date,
      user_id: request.UserID,
    });

    return response.json(appointment);
  }

  async index(request, response) {
    const appointment = await Appointment.findAll({
      where: { user_id: request.UserID },
      attributes: ['id', 'date', 'provider_id'],
    });

    return response.status(200).json(appointment);
  }
}

export default new AppointmentController();
