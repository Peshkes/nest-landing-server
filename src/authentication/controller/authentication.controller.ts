import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { CookieOptions, Request, Response } from "express";
import { AuthenticationService } from "../service/authentication.service";
import { RegistrationDto } from "../dto/registration.dto";
import { SignInDto } from "../dto/sign-in.dto";
import { CsrfService } from "../../share/services/csrf.service";
import { OwnerAccessGuard } from "../../security/guards/owner-access.guard";
import { PasswordDto } from "../dto/password.dto";
import { EmailDto } from "../dto/email.dto";

@Controller("auth")
export class AuthenticationController {
  private readonly accessAge = 10 * 60 * 1000;
  private readonly refreshAge = 20 * 60 * 1000;

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
    const result = await this.authenticationService.signin(singInDto);
    res.cookie("accessToken", result.tokens.accessToken, this.createCookieOptions(this.accessAge));
    res.cookie("refreshToken", result.tokens.refreshToken, this.createCookieOptions(this.refreshAge));
    return res.send({ _id: result.user._id, name: result.user.name, email: result.user.email });
  }

  @Post("/super/signin")
  async superSignin(@Body() singInDto: SignInDto, @Res() res: Response) {
    const result = await this.authenticationService.superSignin(singInDto);
    res.cookie("accessToken", result.accessToken, this.createCookieOptions(this.accessAge));
    res.cookie("refreshToken", result.refreshToken, this.createCookieOptions(this.refreshAge));
    return res.send({ message: "Успешная авторизация" });
  }

  @Post("/soft/signin")
  async softSignin(@Req() req: Request, @Res() res: Response) {
    const token: string = req.cookies.refreshToken;
    const result = await this.authenticationService.softSignin(token);
    res.cookie("accessToken", result.tokens.accessToken, this.createCookieOptions(this.accessAge));
    res.cookie("refreshToken", result.tokens.refreshToken, this.createCookieOptions(this.refreshAge));
    return res.send({ _id: result.user._id, name: result.user.name, email: result.user.email });
  }

  @Post("/refresh")
  async refresh(@Req() req: Request, @Res() res: Response) {
    const token: string = req.cookies.refreshToken;
    const result = await this.authenticationService.refresh(token);
    res.cookie("accessToken", result.accessToken, this.createCookieOptions(this.accessAge));
    res.cookie("refreshToken", result.refreshToken, this.createCookieOptions(this.refreshAge));
    return res.send({ message: "Успешный рефреш" });
  }

  @Post("/logout")
  logout(@Res() res: Response) {
    return res.clearCookie("accessToken", { httpOnly: true }).clearCookie("refreshToken", { httpOnly: true });
  }

  @Put("/:id")
  @UseGuards(OwnerAccessGuard)
  async updatePassword(@Param("id") id: string, @Body() passwordDto: PasswordDto) {
    return await this.authenticationService.updatePassword(id, passwordDto);
  }

  @Put("/reset")
  async startResetPassword(@Param("email") @Body() email: EmailDto) {
    return await this.authenticationService.startResetPassword(email);
  }

  @Put("/reset/:id/:token")
  async finishResetPassword(@Param("id") id: string, @Param("token") token: string, @Body() passwordDto: PasswordDto) {
    return await this.authenticationService.finishResetPassword(id, token, passwordDto);
  }

  @Put("/verify/:id")
  async startVerifyEmail(@Param("id") id: string) {
    return await this.authenticationService.startVerifyEmail(id);
  }

  @Put("/verify/:id/:token")
  async finishVerifyEmail(@Param("id") id: string, @Param("token") token: string) {
    return await this.authenticationService.finishVerifyEmail(id, token);
  }

  createCookieOptions(maxAge: number): CookieOptions {
    return {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge,
    };
  }
}
