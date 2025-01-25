import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { SignInDto } from "../dto/sign-in.dto";
import { RegistrationDto } from "../dto/registration.dto";
import bcrypt from "bcryptjs";
import UserModel from "../persistence/user.model";
import { JwtService } from "../../share/services/jwt.service";
import SuperUserModel from "../persistence/super-user.model";
import { JwtTokenPayload } from "../../share/share.types";
import { SignInResponse } from "../authentication.types";
import { AuthException } from "../error/authentication-exception.class";

@Injectable()
export class AuthenticationService {
  constructor(private readonly jwtService: JwtService) {}

  async registration({ name, email, password, phone }: RegistrationDto) {
    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) throw new BadRequestException("Email уже занят");

      const hashedPassword = await bcrypt.hash(password, 10);
      await new UserModel({
        name,
        email,
        phone,
        password: hashedPassword,
      }).save();

      return this.signin({ email, password });
    } catch (error) {
      throw AuthException.RegistrationException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signin(singInDto: SignInDto): Promise<SignInResponse> {
    try {
      const user = await UserModel.findOne({ email: singInDto.email });
      if (!user) throw new BadRequestException("Пользователь с имейлом " + singInDto.email + " не найден");
      const tokens = await this.processSignin(user._id, singInDto.password, user.password);
      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        tokens,
      };
    } catch (error) {
      throw AuthException.SignInException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async softSignin(token: string) {
    try {
      if (!token) throw new BadRequestException("Токен не пришел ");
      const decodedToken: JwtTokenPayload = this.jwtService.verifyToken(token);
      const user = await UserModel.findById(decodedToken.userId);
      if (!user) throw new BadRequestException("Пользователь не найден");
      const tokens = this.jwtService.generateTokenPair(decodedToken.userId);
      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        tokens,
      };
    } catch (error) {
      throw AuthException.RefreshException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async superSignin(singInDto: SignInDto) {
    try {
      const user = await SuperUserModel.findOne({ email: singInDto.email });
      if (!user) throw new BadRequestException("Пользователь с имейлом " + singInDto.email + " не найден");
      return this.processSignin(user._id, singInDto.password, user.password, true);
    } catch (error) {
      throw AuthException.SuperSignInException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
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

  async refresh(token: string) {
    try {
      if (!token) throw new BadRequestException("Токен не пришел ");
      const decodedToken: JwtTokenPayload = this.jwtService.verifyToken(token);
      return this.jwtService.generateTokenPair(decodedToken.userId);
    } catch (error) {
      throw AuthException.RefreshException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
