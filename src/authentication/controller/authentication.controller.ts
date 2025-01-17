import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthenticationService } from "../service/authentication.service";
import { RegistrationDto } from "../dto/registration.dto";
import { SignInDto } from "../dto/sign-in.dto";
import { CsrfService } from "../../share/services/csrf.service";
import { SuperUserAccessGuard } from "../../share/guards/super-user-access.guard";

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
    console.log("registration started");
    return this.authenticationService.registration(registrationDto);
  }

  @Post("/signin")
  async signin(@Body() singInDto: SignInDto, @Res() res: Response) {
    const result = await this.authenticationService.signin(singInDto);

    res.cookie("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600 * 1000,
    });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 3600 * 1000, // 7 дней
    });

    return res.send({ message: "Успешная авторизация", email: singInDto.email, name: result.name });
  }

  @Post("/super/signin")
  @UseGuards(SuperUserAccessGuard)
  superSignin(@Body() singInDto: SignInDto) {
    return this.authenticationService.superSignin(singInDto);
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
