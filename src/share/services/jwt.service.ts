import jwt from "jsonwebtoken";
import { BadRequestException, Injectable } from "@nestjs/common";
import crypto from "crypto";
import { JwtTokenPayload } from "../share.types";

@Injectable()
export class JwtService {
  private ACCESS_EXPIRATION_TIME = 300;
  private REFRESH_EXPIRATION_TIME = 900;
  private TOKEN_SECRET = crypto.randomBytes(64).toString("hex");

  generateToken = (_id: string, expirationTime: number, isSuperUser: boolean = false) => {
    const payload: JwtTokenPayload = { userId: _id };
    if (isSuperUser) payload.superAccess = true;

    return jwt.sign(payload, this.TOKEN_SECRET, { expiresIn: expirationTime });
  };

  verifyToken = (token: string): JwtTokenPayload => {
    try {
      const jwtPayload = jwt.verify(token, this.TOKEN_SECRET) as JwtTokenPayload;
      if (!jwtPayload || !jwtPayload.userId) throw new BadRequestException("В токене не хватает данных");
      return jwtPayload;
    } catch (error: any) {
      throw new BadRequestException("Token is not valid: " + error.message);
    }
  };

  generateTokenPair = (_id: string, isSuperUser: boolean = false) => {
    return {
      accessToken: this.generateToken(_id, this.ACCESS_EXPIRATION_TIME, isSuperUser),
      refreshToken: this.generateToken(_id, this.REFRESH_EXPIRATION_TIME),
    };
  };
}
