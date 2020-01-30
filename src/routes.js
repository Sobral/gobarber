import { Router } from 'express';
import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController';

const routes = new Router();

/// User
routes.post('/users', UserController.store);
routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);


//Session
routes.post('/sessions', SessionController.store);

export default routes;
