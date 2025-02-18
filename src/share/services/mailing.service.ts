import nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: this.configService.get<number>("SMTP_PORT"),
      secure: this.configService.get<boolean>("SMTP_SECURE"),
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASSWORD"),
      },
    });
  }

  async sendMailWithHtmlFromNoReply(to: string, subject: string, html: string) {
    await this.sendMailWithHtml("no-reply@snappitch.ru", to, subject, html);
  }

  async sendMailWithHtml(from: string, to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }

  async sendMailFromNoReply(to: string, subject: string, text: string) {
    await this.sendMail("no-reply@snappitch.ru", to, subject, text);
  }

  async sendMail(from: string, to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from,
      to,
      subject,
      text,
    });
  }
}
