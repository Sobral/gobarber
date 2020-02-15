import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    const { host, auth, secure, port } = mailConfig;

    this.transport = nodemailer.createTransport({
      host,
      port,
      auth: auth.user ? auth : null,
      secure,
    });
  }

  sendMail(message) {
    return this.transport.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
