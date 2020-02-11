import User from '../models/User';

class ProviderController {
  async index(request, response) {
    const users = await User.findAll({
      where: {
        provider: true,
      },
      attributes: ['id', 'name', 'email', 'provider'],
    });

    return response.status(200).json(users);
  }
}

export default new ProviderController();
