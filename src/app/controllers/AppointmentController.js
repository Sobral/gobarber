import * as Yup from 'yup';
import { Op } from 'sequelize';
import User from '../models/User';
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
     * Check if provider exist
     */
    const provider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!provider) {
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
}

export default new AppointmentController();
