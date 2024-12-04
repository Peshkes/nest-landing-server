import { NextFunction, Response } from "express";
import { Injectable, NestMiddleware } from "@nestjs/common";
import UserModel from "../../authentication/persistence/userModel";
import { User } from "../../authentication/authentication.types";
import { JwtService } from "../../authentication/jwt.service";
import { RequestWithUser } from "../interfaces/request-with-user.interface";

@Injectable()
export class JwtRequestMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken)
        return res.status(401).json({ message: "Отсутствует токен доступа" });
      const jwtDecoded = this.jwtService.verifyToken(accessToken, false);
      const user: User | null = await UserModel.findById(jwtDecoded.userId);
      if (!user)
        return res.status(404).json({ message: "Пользователь не найден" });
      else {
        req.user = user;
        next();
      }
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: `Ошибка при проверке доступа: ${error.message}` });
    }
  }
}
