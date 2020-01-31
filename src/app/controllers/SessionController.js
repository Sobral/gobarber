import User from '../models/User';
import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth';
class SessionController{
  async store(request, response){

    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required()
    });

    const schemaValid = await schema.isValid(request.body);

    if (!schemaValid) {
      return response.status(400).json({ error: 'Validation Fails!' });
    }
    const {email, password} = request.body;

    const user = await User.findOne({ where:{ email }});

    if(!user) {
      return response.status(401).json({error:"User not found."});
    }

    const user_session_authorized = await user.checkPassword(password);

    if(!user_session_authorized){
      return response.status(401).json({error: 'Password does not match.'});
    }

    const {id, name} = user;
    const {secretKey, expiresIn} = authConfig;

    return response.json({
      user:{
        id,
        name,
        email,
      },
      token: jwt.sign({id}, secretKey, {expiresIn}),
    });
  }

}

export default new SessionController();
