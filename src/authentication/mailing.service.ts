import nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly baseUrl =
    this.configService.get<string>("HOST") +
    ":" +
    this.configService.get<string>("PORT");

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

  async sendMailWithHtml(
    from: string,
    to: string,
    subject: string,
    html: string,
  ) {
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
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
