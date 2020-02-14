import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class ScheduleController {
  async index(request, response) {
    const { date, page = 1 } = request.query;
    const parsedDate = parseISO(date);
    const provider_id = request.UserID;

    const appointments = await Appointment.findAll({
      where: {
        [Op.and]: [
          { provider_id },
          { canceled_at: null },
          {
            date: {
              [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
            },
          },
        ],
      },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'user',
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

    return response.status(200).json(appointments);
  }
}

export default new ScheduleController();
