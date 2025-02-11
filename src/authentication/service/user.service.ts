import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import UserModel from "../persistence/user.model";
import { User } from "../authentication.types";
import { ClientSession } from "mongoose";
import { PasswordDto } from "../dto/password.dto";
import bcrypt from "bcryptjs";
import { EmailDto } from "../dto/email.dto";

import crypto from "crypto";
import ChangePasswordTokenModel from "../persistence/change-password-token.model";
import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { MailService } from "../../share/services/mailing.service";
import { SubscriptionService } from "../../subscription/service/subscription.service";
import { getAllPaginatedOffersQuery } from "../queries/get-all-paginated-offers.query";
import { runSession } from "../../share/functions/run-session";
import { UserException } from "../error/user-exception.class";
import { PaymentSystems } from "../../subscription/subscription.types";

@Injectable()
export class UserService {
  constructor(
    private readonly mailService: MailService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async getAllUsers() {
    try {
      const accounts: User[] = await UserModel.find();
      return accounts;
    } catch (error: any) {
      throw UserException.GetAllUsersException(error.message, error.statusCode);
    }
  }

  async getUser(id: string) {
    try {
      const user = await this.findUserById(id);
      return { email: user.email, name: user.name, _id: user._id };
    } catch (error: any) {
      throw UserException.GetUserException(error.message, error.statusCode);
    }
  }

  async userExistsById(id: string, session: ClientSession) {
    return UserModel.exists({ id }).session(session);
  }

  async getOffersByUserId(id: string, page: number, limit: number, roles: string[], statuses: string[]) {
    try {
      return getAllPaginatedOffersQuery(id, roles, statuses, page, limit);
    } catch (error: any) {
      throw UserException.GetOffersException(error.message, error.statusCode);
    }
  }

  async removeUser(id: string) {
    try {
      const account: User | null = await UserModel.findByIdAndDelete(id); //findOneAndDelete({ _id: id }).
      if (!account) throw new BadRequestException("Пользователь не найден");
      return { email: account.email, name: account.name, _id: account._id };
    } catch (error: any) {
      throw UserException.RemoveUserException(error.message, error.statusCode);
    }
  }

  async updatePassword(id: string, passwordDto: PasswordDto) {
    await this.runUserSession(async (session) => {
      await this.processUpdatePassword(id, passwordDto, session);
    }, UserException.UpdatePasswordException);
  }

  private async processUpdatePassword(id: string, passwordDto: PasswordDto, session: ClientSession) {
    const account: User = await this.findUserById(id);

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
    ).session(session);
  }

  async startResetPassword(email: EmailDto) {
    await this.runUserSession(async (session) => {
      const existingUser = await UserModel.findOne(email).session(session);
      if (!existingUser) throw new BadRequestException("Пользователся с таким имейлом не найдено");
      await ChangePasswordTokenModel.findByIdAndDelete(existingUser._id);

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(resetToken, 10);
      await new ChangePasswordTokenModel({
        _id: existingUser._id,
        token: hash,
      }).save({ session });

      await this.sendResetPasswordEmail(email.email, existingUser._id.toString(), resetToken);
    }, UserException.StartResetPasswordException);
  }

  private async sendResetPasswordEmail(email: string, userId: string, token: string) {
    const link = `localhost:27000/account/reset_password/${userId}/${token}`;
    await this.mailService.sendMailWithHtmlFromNoReply(
      email,
      "Запрос на сброс пароля",
      `<b>Для сброса пароля пожалуйста пройдите по <a href="${link && link}">этой ссылке</a></b>`,
    );
  }

  async finishResetPassword(id: string, token: string, passwordDto: PasswordDto) {
    await this.runUserSession(async (session) => {
      const passwordResetToken = await ChangePasswordTokenModel.findByIdAndDelete(id).session(session);
      if (!passwordResetToken || !(await bcrypt.compare(token, passwordResetToken.token)))
        throw new BadRequestException("Токен смены пароля некорректен или истек");
      await this.processUpdatePassword(id, passwordDto, session);
    }, UserException.FinishResetPasswordException);
  }

  async addSubscription(id: string, tier_id: string, payment_system: PaymentSystems) {
    return this.runUserSession(async (session) => {
      const user = await this.findUserById(id, session);
      if (user && !user.subscription) {
        await UserModel.updateOne(
          { account: id },
          {
            subscription: await this.subscriptionService.createNewSubscription(id, tier_id, payment_system, session),
          },
        ).session(session);
      }
    }, UserException.AddSubscriptionException);
  }

  async addOffersIdsToUser(user_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession) {
    const user = this.findUserById(user_id, session);

  }

  async createDraftOffer(id: string, addOfferData: DraftOfferDto) {
    return "";
  }

  async publishOfferWithoutDraft(id: string, offer: DraftOfferDto) {
    return "";
  }

  async publishDraftOffer(id: string, offer_id: string) {
    return "";
  }

  async unpublishPublicOffer(id: string, offer_id: string) {
    return "";
  }

  async draftifyPublicOffer(id: string, offer_id: string) {
    return "";
  }

  async duplicateDraftOffer(id: string, offer_id: string) {
    return "";
  }

  async removeOffer(id: string, offer_id: string) {
    return undefined;
  }

  async copyToGroup(id: string, group_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
  }

  async moveToGroup(id: string, group_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
  }

  //Utils
  private async findUserById(id: string, session?: ClientSession) {
    const user: User = (await UserModel.findById(id).session(session)) as unknown as User;
    if (!user) throw new BadRequestException("Пользователь не найден");
    return user;
  }

  private async runUserSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(UserModel, callback, customError);
  }
}
