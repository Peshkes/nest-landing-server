import { NextFunction, Response } from "express";
import { Injectable, NestMiddleware } from "@nestjs/common";
import UserModel from "../../authentication/persistence/user.model";
import { User } from "../../authentication/authentication.types";
import { JwtService } from "../services/jwt.service";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import chalk from "chalk";

@Injectable()
export class JwtRequestMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies.accessToken;

      if (!accessToken) {
        console.log(chalk.red(`[JWT Middleware] No access token found for ${req.method} ${req.originalUrl}`));
        return res.status(401).json({ message: "Отсутствует токен доступа" });
      }

      const jwtDecoded = this.jwtService.verifyToken(accessToken);
      const user: User | null = await UserModel.findById(jwtDecoded.userId);

      if (!user) {
        console.log(chalk.red(`[JWT Middleware] User not found for token in ${req.method} ${req.originalUrl}`));
        return res.status(404).json({ message: "Пользователь не найден" });
      } else {
        console.log(chalk.red(`[JWT Middleware] User authorized: ${user._id} for ${req.method} ${req.originalUrl}`));
        req.user = user;
        if (jwtDecoded.superAccess) req.superAccess = true;
        next();
      }
    } catch (error: any) {
      console.error(chalk.red(`[JWT Middleware] Error verifying token for ${req.method} ${req.originalUrl}: ${error.message}`));
      return res.status(500).json({ message: `Ошибка при проверке доступа: ${error.message}` });
    }
  }
}
