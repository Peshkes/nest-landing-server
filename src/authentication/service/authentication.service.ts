import { BadRequestException, Injectable } from "@nestjs/common";
import { SignInDto } from "../dto/sign-in.dto";
import { RegistrationDto } from "../dto/registration.dto";
import bcrypt from "bcryptjs";
import UserModel from "../persistence/user.model";
import { JwtService } from "../../share/services/jwt.service";
import SuperUserModel from "../persistence/super-user.model";
import { JwtTokenPayload } from "../../share/share.types";

@Injectable()
export class AuthenticationService {
  constructor(private readonly jwtService: JwtService) {}

  async registration({ name, email, password }: RegistrationDto) {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new BadRequestException("Email уже занят");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      superUser: true,
      name,
      email,
      password: hashedPassword,
      subscription: null,
    });

    await newUser.save();

    return this.signin({ email, password });
  }

  async signin(singInDto: SignInDto) {
    const user = await UserModel.findOne({ email: singInDto.email });
    if (!user) throw new BadRequestException("Пользователь с имейлом " + singInDto.email + " не найден");
    return this.processSignin(user._id, user.password, singInDto.password);
  }

  async superSignin(singInDto: SignInDto) {
    const user = await SuperUserModel.findOne({ email: singInDto.email });
    if (!user) throw new BadRequestException("Пользователь с имейлом " + singInDto.email + " не найден");
    return this.processSignin(user._id, user.password, singInDto.password, true);
  }

  private async processSignin(id: string, firstPass: string, secondPass: string, isSuperUser: boolean = false) {
    await this.checkPassword(firstPass, secondPass);
    return this.jwtService.generateTokenPair(id, isSuperUser);
  }

  private async checkPassword(firstPassword: string, secondPassword: string) {
    const isPasswordCorrect = await bcrypt.compare(firstPassword, secondPassword);
    if (!isPasswordCorrect) throw new BadRequestException("Неверный пароль");
  }

  refresh(token: string) {
    if (!token) throw new BadRequestException("Токен не пришел ");
    const decodedToken: JwtTokenPayload = this.jwtService.verifyToken(token);
    return this.jwtService.generateTokenPair(decodedToken.userId);
  }
}
