import User from '../models/User';

export default {
  async store (request, response) {
      const {name, email, password, provider} = request.body;

      let user = await User.findOne({ where: { email } });

      if(!user){

        user = await User.create({
            name,
            email,
            password_hash: password,
            provider
        });

      }

      return response.json(user);
  },

  async index(request, response){
    const users = await User.findAll();

    return response.json(users);
  },

  async show(request, response){
    const {id} = request.params;

    const user = await User.findOne({ where: { id } });

    if(!user){
      return response.status(400).json({error: "User not found!"})
    }

    return response.json(user);
  }
};
