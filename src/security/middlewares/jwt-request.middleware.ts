import { NextFunction, Response } from "express";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { User } from "../../authentication/authentication.types";
import { JwtService } from "../../share/services/jwt.service";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";
import chalk from "chalk";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "../../authentication/persistence/user.schema";
import { SuperUserDocument } from "../../authentication/persistence/super-user.schema";

@Injectable()
export class JwtRequestMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SuperUserDocument.name) private readonly superUserModel: Model<SuperUserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies.accessToken;

      if (!accessToken) {
        console.log(chalk.red(`[JWT Middleware] No access token found for ${req.method} ${req.originalUrl}`));
        return res.status(401).json({ message: "Отсутствует токен доступа" });
      }

      const jwtDecoded = this.jwtService.verifyToken(accessToken);
      let user: User;
      if (jwtDecoded.superAccess) user = await this.superUserModel.findById(jwtDecoded.userId);
      else user = await this.userModel.findById(jwtDecoded.userId);

      if (!user) {
        console.log(chalk.red(`[JWT Middleware] User not found for token in ${req.method} ${req.originalUrl}`));
        return res.status(404).json({ message: "Пользователь не найден" });
      } else {
        console.log(chalk.green(`[JWT Middleware] User authorized: ${user._id} for ${req.method} ${req.originalUrl}`));
        req.user_id = user._id;
        if (jwtDecoded.superAccess) req.superAccess = true;
        next();
      }
    } catch (error: any) {
      console.error(chalk.red(`[JWT Middleware] Error verifying token for ${req.method} ${req.originalUrl}: ${error.message}`));
      return res.status(error.statusCode || 500).json({ message: `Ошибка при проверке доступа: ${error.message}` });
    }
  }
}
