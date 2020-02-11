import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';

import MulterConfig from './config/multer';

const routes = new Router();

const upload = multer(MulterConfig);

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users/', UserController.update);
routes.delete('/users/:id', UserController.delete);

// Session

routes.post('/files', upload.single('file'), FileController.store);
export default routes;
