import User from '../models/User';

export default {
  async store (request, response) {
      const {name, email, password, provider} = request.body;

      const [user, created] = await User.findOrCreate({
        where: { email },
        defaults: {
          name,
          email,
          password_hash: password,
          provider
        }
      });
      let status = created ? 201 : 200;

      return response.status(status).json(user);
  },

  async index(request, response){
    const users = await User.findAll();

    return response.json(users);
  },

  async show(request, response){
    const {id} = request.params;

    const user = await User.findOne({ where: { id } });

    if(!user){
      return response.status(404).json({error: "User not found!"})
    }

    return response.status(200).json(user);
  },
  async update(request, response){
    const {id} = request.params;

    const user = await User.findOne({ where: { id } });

    if(!user){
      return response.status(404).json({error: "User not found!"})
    }

    const {name, email, password} = request.body;

    await User.update(
      { name, email, password },
      { where: { id }
    });


    return response.sendStatus(201);
  },
  async delete(request, response){
    const {id} = request.params;

    const user = await User.findOne({ where: { id } });

    if(!user){
      return response.status(404).json({error: "User not found!"})
    }

    User.destroy({ where: {id }});

    return response.sendStatus(204);
  },
};
