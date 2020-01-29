const express = require('express');
const routes = require('./routes');


class App {
  constructor() {
    this.server = express();
    this.middleware();
    this.routes();
  }

  middleware(){
    console.log('Middlewares loaded!')
  }

  routes(){
    console.log('Routes loaded!')
    this.server.use(routes)
  }
}

module.exports = new App().server;