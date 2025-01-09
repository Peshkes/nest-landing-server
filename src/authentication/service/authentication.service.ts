import { BadRequestException, Injectable } from "@nestjs/common";
import { SignInDto } from "../dto/sign-in.dto";
import { RegistrationDto } from "../dto/registration.dto";
import bcrypt from "bcryptjs";
import UserModel from "../persistence/userModel";
import { JwtTokenPayload, User } from "../authentication.types";
import { JwtService } from "../../share/services/jwt.service";

@Injectable()
export class AuthenticationService {
  constructor(private readonly jwtService: JwtService) {}

  async registration({ name, email, password }: RegistrationDto) {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new BadRequestException("Email уже занят");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      superUser: false,
      name,
      email,
      password: hashedPassword,
      lastPasswords: [],
      subscription: null,
      public_offers: [],
      draft_offers: [],
    });

    await newUser.save();

    return this.signin({ email, password });
  }

  async signin(singInDto: SignInDto) {
    const existingUser: User | null = await UserModel.findOne({
      email: singInDto.email,
    });
    if (!existingUser) throw new BadRequestException("Пользователь с имейлом " + singInDto.email + " не найден");

    const isPasswordCorrect = await bcrypt.compare(singInDto.password, existingUser.password);

    if (!isPasswordCorrect) throw new BadRequestException("Неверный пароль");
    return { tokens: this.jwtService.generateTokenPair(existingUser._id.toString()), name: existingUser.name };
  }

  refresh(token: string) {
    if (!token) throw new BadRequestException("Токен не пришел ");
    const decodedToken: JwtTokenPayload = this.jwtService.verifyToken(token, true);
    return this.jwtService.generateTokenPair(decodedToken.userId);
  }
}
