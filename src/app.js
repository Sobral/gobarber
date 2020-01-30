import express, { json } from 'express';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();
    this.middleware();
    this.routes();
  }

  middleware() {
    this.server.use(json());
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
