import { Router } from 'express';
import UserController from './app/controllers/UserController'

const routes = new Router();

/// User
routes.post('/users', UserController.store);

routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);

export default routes;
