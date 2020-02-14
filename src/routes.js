import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import ProviderController from './app/controllers/ProviderController';

import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import MulterConfig from './config/multer';
import NotificationController from './app/controllers/NotificationController';

const routes = new Router();

const upload = multer(MulterConfig);

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users/', UserController.update);
routes.delete('/users/:id', UserController.delete);

routes.get('/providers/', ProviderController.index);
routes.post('/appointments/', AppointmentController.store);
routes.get('/appointments/', AppointmentController.index);

// Session
routes.get('/schedules', ScheduleController.index);
routes.post('/files', upload.single('file'), FileController.store);

routes.get('/notifications', NotificationController.index);
export default routes;
