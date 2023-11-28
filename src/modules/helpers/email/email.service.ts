import { Injectable } from '@nestjs/common';

import { createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly nodeMailerTransport: any;
  constructor() {
    this.nodeMailerTransport = createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,

      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  public sendForgotPasswordMail(email: string, token: string) {
    const redirectLink = `${process.env.FORGOT_PASSWORD_LINK}?token=${token}`;

    return this.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      date: new Date(),
      subject: 'Reset password on SMT CLUB',
      text: 'To reset your password, follow the link',
      html: `<article><h1>To reset your password click the link</h1><a href='${redirectLink}'>${redirectLink}</a></article>`,
    });
  }

  public async sendConfirmationCodeMail(email: string, token: string) {
    const redirectLink = `${process.env.CONFIRMATION_EMAIL_LINK}?token=${token}`;

    return this.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      date: new Date(),
      subject: 'Confirmation code for SMT CLUB',
      html: `<article><h1>To confirm your registration click the link</h1><a href='${redirectLink}'>${redirectLink}</a></article>`,
    });
  }

  private async sendMail(options) {
    try {
      await this.nodeMailerTransport.sendMail(options);
      return true;
    } catch (err) {
      return false;
    }
  }
}
