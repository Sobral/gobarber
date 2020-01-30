import User from '../models/User';

class UserController {
  async store (request, response) {
      const {name, email, password, provider} = request.body;

      let user = await User.findOne({ where: { email } });

      if(user){
        return response.status(400).json({error:"User already exist!"});
      }

      const {id} = await User.create({
          name,
          email,
          password,
          provider
      });

      return response.status(201).json({id, name, email, provider});
  }

  async index(request, response){
    const users = await User.findAll();

    return response.json(users);
  }

  async show(request, response){
    const {id} = request.params;

    const user = await User.findOne({ where: { id } });

    if(!user){
      return response.status(400).json({error: "User not found!"})
    }

    return response.status(200).json(user);
  }

  async update(request, response){
    const {id} = request.params;

    const user = await User.findOne({ where: { id } });

    if(!user){
      return response.status(400).json({error: "User not found!"})
    }

    const {name, email, password} = request.body;

    await User.update(
      { name, email, password },
      { where: { id }
    });


    return response.sendStatus(201);
  }

  async delete(request, response){
    const {id} = request.params;

    const user = await User.findOne({ where: { id } });

    if(!user){
      return response.status(400).json({error: "User not found!"})
    }

    User.destroy({ where: {id }});

    return response.sendStatus(204);
  }
};

export default new UserController();
