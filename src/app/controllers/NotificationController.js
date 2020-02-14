import Notification from '../schemas/Notification';

class NotificationController {
  async index(request, response) {
    const notification = await Notification.find({
      user: request.UserID,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return response.status(200).json(notification);
  }
}

export default new NotificationController();
