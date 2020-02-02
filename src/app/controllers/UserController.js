import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required(),
      provider: Yup.boolean().required(),
    });

    const schemaValid = await schema.isValid(request.body);

    if (!schemaValid) {
      return response.status(401).json({ error: 'Validation Fails!' });
    }

    const { name, email, password, provider } = request.body;

    const user = await User.findOne({ where: { email } });

    if (user) {
      return response.status(400).json({ error: 'User already exist!' });
    }

    const { id } = await User.create({
      name,
      email,
      password,
      provider,
    });

    return response.status(201).json({ id, name, email, provider });
  }

  async index(request, response) {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'provider'],
    });

    return response.json(users);
  }

  async show(request, response) {
    const schema = Yup.object().shape({
      id: Yup.number(),
    });

    const schemaValid = await schema.isValid(request.params);

    if (!schemaValid) {
      return response.status(401).json({ error: 'Validation Fails!' });
    }

    const { id } = request.params;

    const user = await User.findOne({
      where: { id },
      attributes: ['id', 'name', 'email', 'provider'],
    });

    if (!user) {
      return response.status(400).json({ error: 'User not found!' });
    }

    return response.status(200).json(user);
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    const schemaValid = await schema.isValid(request.body);

    if (!schemaValid) {
      return response.status(400).json({ error: 'Validation Fails!' });
    }

    const id = request.UserID;

    const { email, oldPassword } = request.body;

    // / I wonder if it's possible that user does'nt exist
    const user = await User.findByPk(id);

    if (email && email !== user.email) {
      const userExist = await User.findOne({ where: { email } });
      if (userExist) {
        return response.status(400).json({ error: 'User already exist!' });
      }
    }

    if (oldPassword) {
      const passwordMatches = await user.checkPassword(oldPassword);

      if (!passwordMatches) {
        return response.status(401).json({ error: 'Password does not match!' });
      }
    }

    await user.update(request.body);

    return response.status(201).json({
      id,
      name: user.name,
      email: user.email,
      provider: user.provider,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    const user = await User.findOne({ where: { id } });

    if (!user) {
      return response.status(400).json({ error: 'User not found!' });
    }

    User.destroy({ where: { id } });

    return response.sendStatus(204);
  }
}

export default new UserController();
