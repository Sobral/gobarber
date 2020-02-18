import * as Sentry from '@sentry/node';
import express, { json } from 'express';
import { resolve } from 'path';
import 'express-async-errors';
import Youch from 'youch';
import routes from './routes';
import SentryConfig from './config/sentry';
import './database';
import 'dotenv/config';

class App {
  constructor() {
    this.server = express();
    Sentry.init(SentryConfig);

    this.middleware();
    this.routes();
  }

  middleware() {
    this.server.use(this.onError);
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(json());
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  async onError(error, request, response, next) {
    if (process.env.NODE_ENV === 'development') {
      const errors = await Youch(error, request).toJSON();

      return response.status(500).json(errors);
      // res.end(`${res.sentry}\n`);}
    }
    return response.status(500).json({ error: 'Internal server Error' });
  }
}

export default new App().server;
