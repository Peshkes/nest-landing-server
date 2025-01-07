import { BadRequestException, Injectable } from "@nestjs/common";
import UserModel from "../persistence/userModel";
import { User } from "../authentication.types";
import { RuntimeException } from "@nestjs/core/errors/exceptions";
import mongoose from "mongoose";
import { PasswordDto } from "../dto/password.dto";
import bcrypt from "bcryptjs";
import { EmailDto } from "../dto/email.dto";

import crypto from "crypto";
import ChangePasswordTokenModel from "../persistence/changePasswordTokenModel";
import { SubscriptionDto } from "../../share/dto/SubscriptionDto";
import { MoveOffersRequestDto } from "../dto/move-offers-request.dto";
import { MailService } from "../../share/services/mailing.service";
import { SubscriptionService } from "../../subscription/service/subscription.service";

@Injectable()
export class UserService {
  constructor(
    private readonly mailService: MailService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async getAllUsers() {
    try {
      const accounts: User[] = await UserModel.find();
      return accounts.map((user) => ({
        email: user.email,
        name: user.name,
        _id: user._id,
        subscription: user.subscription,
        publicOffers: user.publicOffers,
        draftOffers: user.draftOffers,
      }));
    } catch (error: any) {
      throw new RuntimeException(`Ошибка при получении списка аккаунтов: ${error.message}`);
    }
  }

  async getUser(object: string) {
    const isObjectId = mongoose.Types.ObjectId.isValid(object);
    try {
      const account: User | null = isObjectId ? await UserModel.findById(object) : await UserModel.findOne({ email: object });
      if (!account) throw new BadRequestException("Пользователся с таким имейлом не найдено");
      return { email: account.email, name: account.name, _id: account._id };
    } catch (error: any) {
      throw new RuntimeException(`Ошибка при получении аккаунта: ${error.message}`);
    }
  }

  async removeUser(id: string) {
    try {
      const account: User | null = await UserModel.findByIdAndDelete(id); //findOneAndDelete({ _id: id }).
      if (!account) throw new BadRequestException("Пользователь не найден");
      return { email: account.email, name: account.name, _id: account._id };
    } catch (error: any) {
      throw new RuntimeException(`Ошибка при удалении аккаунта: ${error.message}`);
    }
  }

  async updatePassword(object: string, passwordDto: PasswordDto) {
    const isObjectId = mongoose.Types.ObjectId.isValid(object);
    try {
      const account: User | null = isObjectId ? await UserModel.findById(object) : await UserModel.findOne({ email: object });

      if (!account) throw new BadRequestException("Пользователь не найден");

      if (await bcrypt.compare(passwordDto.password, account.password))
        throw new BadRequestException("Новый пароль не должен совпадать со старым");

      const lastPasswords = account.lastPasswords;
      for (const pass of account.lastPasswords) {
        if (await bcrypt.compare(passwordDto.password, pass))
          throw new BadRequestException("Этот пароль уже был использован. Пожайлуйста придумайте другой пароль");
      }
      lastPasswords.unshift(account.password);
      if (lastPasswords.length > 3) lastPasswords.pop();

      await UserModel.updateOne(
        { account: account._id },
        {
          password: await bcrypt.hash(passwordDto.password, 10),
          lastPasswords: lastPasswords,
        },
      );
    } catch (error: any) {
      throw new RuntimeException(`Ошибка при обновлении пароля: ${error.message}`);
    }
  }

  async startResetPassword(email: EmailDto) {
    try {
      const existingUser = await UserModel.findOne(email);
      if (!existingUser) throw new BadRequestException("Пользователся с таким имейлом не найдено");
      const token = await ChangePasswordTokenModel.findOne({
        userId: existingUser._id,
      });
      if (token) await token.deleteOne();
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(resetToken, 10);
      await new ChangePasswordTokenModel({
        userId: existingUser._id,
        token: hash,
        createdAt: Date.now(),
      }).save();

      await this.sendResetPasswordEmail(email.email, existingUser._id.toString(), resetToken);
    } catch (error: any) {
      throw new RuntimeException(`Ошибка при обновлении пароля: ${error.message}`);
    }
  }

  private async sendResetPasswordEmail(email: string, userId: string, token: string) {
    const link = `localhost:27000/account/reset_password/${userId}/${token}`;
    await this.mailService.sendMailWithHtml(
      "no-reply@snapitch.com",
      email,
      "Запрос на сброс пароля",
      `<b>Для сброса пароля пожалуйста пройдите по <a href="${link && link}">этой ссылке</a></b>`,
    );
  }

  async finishResetPassword(id: string, token: string, passwordDto: PasswordDto) {
    const passwordResetToken = await ChangePasswordTokenModel.findOne({
      userId: id,
    });
    if (!passwordResetToken || !(await bcrypt.compare(token, passwordResetToken.token)))
      throw new BadRequestException("Токен смены пароля некорректен или истек");
    await this.updatePassword(id, passwordDto);
    await ChangePasswordTokenModel.findByIdAndDelete(id);
  }

  async addSubscription(id: string, subscription: SubscriptionDto) {
    const account: User | null = await UserModel.findById(id);
    if (!account) throw new BadRequestException("Пользователь не найден");
    if (account && !account.subscription) {
      try {
        await UserModel.updateOne(
          { account: account._id },
          {
            subscription: await this.subscriptionService.createNewSubscription(subscription),
          },
        );
      } catch (error: any) {
        throw new RuntimeException(`Ошибка при добвлении подписки: ${error.message}`);
      }
    }
  }

  async copyToGroup(group_id: string, moveOffersRequestDto: MoveOffersRequestDto) {}

  async moveToGroup(group_id: string, moveOffersRequestDto: MoveOffersRequestDto) {}
}
