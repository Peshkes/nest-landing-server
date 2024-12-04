import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthenticationService } from "../service/authentication.service";
import { RegistrationDto } from "../dto/registration.dto";
import { generateToken } from "../../config/csrf.config";
import { SignInDto } from "../dto/sign-in.dto";

@Controller("auth")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Get("/csrf")
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    return generateToken(req, res, true);
  }

  @Post("/registration")
  registration(@Body() registrationDto: RegistrationDto) {
    return this.authenticationService.registration(registrationDto);
  }

  @Post("/signin")
  signin(@Body() singInDto: SignInDto) {
    return this.authenticationService.signin(singInDto);
  }

  @Post("/refresh")
  refresh(@Req() req: Request) {
    const token: string = req.cookies.refreshToken;
    return this.authenticationService.refresh(token);
  }

  @Post("/logout")
  logout(@Res() res: Response) {
    return res
      .clearCookie("accessToken", { httpOnly: true })
      .clearCookie("refreshToken", { httpOnly: true });
  }
}