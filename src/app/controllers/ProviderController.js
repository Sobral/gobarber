import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(request, response) {
    const users = await User.findAll({
      where: {
        provider: true,
      },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['path', 'name', 'url'],
      },
    });

    return response.status(200).json(users);
  }

  async providerExist(id) {
    const provider = await User.findOne({
      where: { id, provider: true },
    });

    if (!provider) return false;
    return true;
  }
}

export default new ProviderController();
