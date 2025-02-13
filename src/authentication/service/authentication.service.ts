import { BadRequestException, HttpException, HttpStatus, Injectable, OnModuleInit } from "@nestjs/common";
import { SignInDto } from "../dto/sign-in.dto";
import { RegistrationDto } from "../dto/registration.dto";
import bcrypt from "bcryptjs";
import { JwtService } from "../../share/services/jwt.service";
import { JwtTokenPayload } from "../../share/share.types";
import { PublicUserData, SignInResponse, User } from "../authentication.types";
import { AuthException } from "../error/authentication-exception.class";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Promise } from "mongoose";
import { PasswordDto } from "../dto/password.dto";
import { EmailDto } from "../dto/email.dto";
import crypto from "crypto";
import { MailService } from "../../share/services/mailing.service";
import { runSession } from "../../share/functions/run-session";
import { VerifyEmailTokenDocument } from "../persistence/verify-email-token.schema";
import { ChangePasswordTokenDocument } from "../persistence/change-password-token.schema";
import { UserDocument } from "../persistence/user.schema";
import { SuperUserDocument } from "../persistence/super-user.schema";

@Injectable()
export class AuthenticationService implements OnModuleInit {
  constructor(
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SuperUserDocument.name) private readonly superUserModel: Model<SuperUserDocument>,
    @InjectModel(VerifyEmailTokenDocument.name) private readonly verifyEmailTokenModel: Model<VerifyEmailTokenDocument>,
    @InjectModel(ChangePasswordTokenDocument.name) private readonly changePasswordTokenModel: Model<ChangePasswordTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async onModuleInit() {
    await this.createAdminUser();
  }

  async registration({ name, email, password, phone }: RegistrationDto) {
    await this.runUserSession(async (session) => {
      const existingUser = await this.userModel.findOne({ email }).session(session);
      if (existingUser) throw new BadRequestException("Email уже занят");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await new this.userModel({
        name,
        email,
        phone,
        password: hashedPassword,
      }).save({ session });

      await this.processStartVerifyEmail(user, session);
      return this.signin({ email, password });
    }, AuthException.RegistrationException);
  }

  async signin(singInDto: SignInDto): Promise<SignInResponse> {
    try {
      const user = await this.userModel.findOne({ email: singInDto.email });
      if (!user) throw new BadRequestException("Пользователь с имейлом " + singInDto.email + " не найден");
      const tokens = await this.processSignin(user._id, singInDto.password, user.password);
      return {
        user: this.createPublicUserData(user),
        tokens,
      };
    } catch (error) {
      throw AuthException.SignInException(error.message, error.statusCode);
    }
  }

  async softSignin(token: string): Promise<SignInResponse> {
    try {
      if (!token) throw new BadRequestException("Токен не пришел ");
      const decodedToken: JwtTokenPayload = this.jwtService.verifyToken(token);
      const user = await this.findUserById(decodedToken.userId);
      const tokens = this.jwtService.generateTokenPair(decodedToken.userId);
      return {
        user: this.createPublicUserData(user),
        tokens,
      };
    } catch (error) {
      throw AuthException.RefreshException(error.message, error.statusCode);
    }
  }

  async superSignin(singInDto: SignInDto) {
    try {
      const user = await this.superUserModel.findOne({ email: singInDto.email });
      if (!user) throw new BadRequestException("Пользователь с имейлом " + singInDto.email + " не найден");
      return this.processSignin(user._id, singInDto.password, user.password, true);
    } catch (error) {
      throw AuthException.SuperSignInException(error.message, error.statusCode);
    }
  }

  async refresh(token: string) {
    try {
      if (!token) throw new BadRequestException("Токен не пришел ");
      const decodedToken: JwtTokenPayload = this.jwtService.verifyToken(token);
      return this.jwtService.generateTokenPair(decodedToken.userId);
    } catch (error) {
      throw AuthException.RefreshException(error.message, error.statusCode);
    }
  }

  async updatePassword(id: string, passwordDto: PasswordDto) {
    await this.runUserSession(async (session) => {
      await this.processUpdatePassword(id, passwordDto, session);
    }, AuthException.UpdatePasswordException);
  }

  async startResetPassword(email: EmailDto) {
    await this.runUserSession(async (session) => {
      const existingUser = await this.userModel.findOne(email).session(session);
      if (!existingUser) throw new BadRequestException("Пользователся с таким имейлом не найдено");
      const resetToken = crypto.randomBytes(32).toString("hex");
      await this.changePasswordTokenModel.findByIdAndDelete(existingUser._id);
      const hash = await bcrypt.hash(resetToken, 10);

      const changePromise = new this.changePasswordTokenModel({ _id: existingUser._id, token: hash });
      const sendResetPromise = this.sendResetPasswordEmail(email.email, existingUser._id.toString(), resetToken);
      await Promise.all(sendResetPromise, changePromise.save({ session }));
    }, AuthException.StartResetPasswordException);
  }

  async finishResetPassword(id: string, token: string, passwordDto: PasswordDto) {
    await this.runUserSession(async (session) => {
      const passwordResetToken = await this.changePasswordTokenModel.findByIdAndDelete(id).session(session);
      if (!passwordResetToken || !(await bcrypt.compare(token, passwordResetToken.token)))
        throw new BadRequestException("Токен смены пароля некорректен или истек");
      await this.processUpdatePassword(id, passwordDto, session);
    }, AuthException.FinishResetPasswordException);
  }

  async startVerifyEmail(id: string) {
    await this.runUserSession(async (session) => {
      const user = await this.findUserById(id, session);
      if (user.email_verified) throw new BadRequestException("Почта уже подтверждена");
      await this.processStartVerifyEmail(user, session);
    }, AuthException.StartVerifyEmailException);
  }

  async finishVerifyEmail(id: string, token: string) {
    await this.runUserSession(async (session) => {
      const tokenData = await this.verifyEmailTokenModel.findByIdAndDelete(id).session(session);
      if (!tokenData || !(await bcrypt.compare(token, tokenData.token))) throw new BadRequestException("Токен некорректен или истек");
      await this.userModel.updateOne({ _id: id }, { email_verified: true });
    }, AuthException.FinishVerifyEmailException);
  }

  //UTILITY METHODS
  private async processUpdatePassword(id: string, passwordDto: PasswordDto, session: ClientSession) {
    const account = await this.findUserById(id);

    if (await bcrypt.compare(passwordDto.password, account.password))
      throw new BadRequestException("Новый пароль не должен совпадать со старым");

    const lastPasswords = account.last_passwords;
    for (const pass of account.last_passwords) {
      if (await bcrypt.compare(passwordDto.password, pass))
        throw new BadRequestException("Этот пароль уже был использован. Пожайлуйста придумайте другой пароль");
    }
    lastPasswords.unshift(account.password);
    if (lastPasswords.length > 3) lastPasswords.pop();

    await this.userModel
      .updateOne(
        { account: account._id },
        {
          password: await bcrypt.hash(passwordDto.password, 10),
          lastPasswords: lastPasswords,
        },
      )
      .session(session);
  }

  private async processStartVerifyEmail(user: User, session: ClientSession) {
    const verifyDataExists = await this.verifyEmailTokenModel.exists({ _id: user._id }).session(session);
    if (!verifyDataExists) {
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const mongoPromise = new this.verifyEmailTokenModel({
        _id: user._id,
        token: verifyToken,
      }).save({ session });
      const sendEmailPromise = this.sendVerifyEmailEmail(user.email, user._id, verifyToken);
      await Promise.all([mongoPromise, sendEmailPromise]);
    }
  }

  private async processSignin(id: string, stringPass: string, hashPass: string, isSuperUser: boolean = false) {
    await this.checkPassword(stringPass, hashPass);
    return this.jwtService.generateTokenPair(id, isSuperUser);
  }

  private async checkPassword(stringPass: string, hashPass: string) {
    const isPasswordCorrect = await bcrypt.compare(stringPass, hashPass);
    if (!isPasswordCorrect) throw new BadRequestException("Неверный пароль");
  }

  private async sendResetPasswordEmail(email: string, userId: string, token: string) {
    const link = `localhost:27000/auth/reset/${userId}/${token}`;
    await this.mailService.sendMailWithHtmlFromNoReply(
      email,
      "Запрос на сброс пароля",
      `<b>Для сброса пароля пожалуйста пройдите по <a href="${link && link}">этой ссылке</a></b>`,
    );
  }

  private async sendVerifyEmailEmail(email: string, userId: string, token: string) {
    const link = `localhost:27000/auth/verify/${userId}/${token}`;
    await this.mailService.sendMailWithHtmlFromNoReply(
      email,
      "Запрос на подтверждение почты",
      `<b>Для подтверждения почты пожалуйста пройдите по <a href="${link && link}">этой ссылке</a></b>`,
    );
  }

  private async findUserById(id: string, session?: ClientSession) {
    const user = await this.userModel.findById(id).session(session);
    if (!user) throw new BadRequestException("Пользователь не найден");
    return user;
  }

  private createPublicUserData(user: User): PublicUserData {
    return { _id: user._id, name: user.name, email: user.email, email_verified: user.email_verified };
  }

  private async runUserSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(this.userModel, callback, customError);
  }

  private async createAdminUser() {
    if (!(await this.superUserModel.exists({ name: "admin" }))) {
      const password = await bcrypt.hash("12345678Vv!", 10);
      try {
        await this.superUserModel.create({
          name: "admin",
          email: "admin@gmail.com",
          password: password,
          lastPasswords: [],
        });
        console.log("Админ успешно создан");
      } catch (error: any) {
        throw new Error(`Ошибка при создании пользователя: ${error.message}`);
      }
    }
  }
}
