import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthenticationService } from "../service/authentication.service";
import { RegistrationDto } from "../dto/registration.dto";
import { SignInDto } from "../dto/sign-in.dto";
import { CsrfService } from "../../share/services/csrf.service";

@Controller("auth")
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly csrfService: CsrfService,
  ) {}

  @Get("/csrf")
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const csrfToken = this.csrfService.generateToken(req, res, true);
    return res.json({ csrfToken });
  }

  @Post("/registration")
  registration(@Body() registrationDto: RegistrationDto) {
    return this.authenticationService.registration(registrationDto);
  }

  @Post("/signin")
  async signin(@Body() singInDto: SignInDto, @Res() res: Response) {
    const tokens = await this.authenticationService.signin(singInDto);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true, // Только для HTTP-запросов, недоступно из JavaScript
      secure: true, // Используется только с HTTPS (рекомендуется для продакшена)
      sameSite: "strict", // Политика SameSite для предотвращения CSRF
      maxAge: 3600 * 1000, // Время жизни в миллисекундах (1 час)
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 3600 * 1000, // 7 дней
    });

    // return this.authenticationService.signin(singInDto);
    return res.send({ message: "Успешная авторизация" });
  }

  @Post("/refresh")
  refresh(@Req() req: Request) {
    const token: string = req.cookies.refreshToken;
    return this.authenticationService.refresh(token);
  }

  @Post("/logout")
  logout(@Res() res: Response) {
    return res.clearCookie("accessToken", { httpOnly: true }).clearCookie("refreshToken", { httpOnly: true });
  }
}
