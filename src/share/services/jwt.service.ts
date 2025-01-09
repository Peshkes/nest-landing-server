import jwt from "jsonwebtoken";
import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtTokenPayload } from "../../authentication/authentication.types";
import SecretStorage from "../../authentication/service/SecretStorage";

@Injectable()
export class JwtService {
  private secretStorage = SecretStorage.getInstance();
  private ACCESS_EXPIRATION_TIME = 300;
  private REFRESH_EXPIRATION_TIME = 900;
  private ACCESS_TOKEN_SECRET = this.secretStorage.getAccessTokenSecret();
  private REFRESH_TOKEN_SECRET = this.secretStorage.getRefreshTokenSecret();

  generateToken = (_id: string, ACCESS_TOKEN_SECRET: string, expirationTime: number) => {
    return jwt.sign({ userId: _id }, ACCESS_TOKEN_SECRET, {
      expiresIn: expirationTime,
    });
  };

  verifyToken = (token: string, isRefresh: boolean): JwtTokenPayload => {
    const key = isRefresh ? this.REFRESH_TOKEN_SECRET : this.ACCESS_TOKEN_SECRET;
    try {
      const jwtPayload = jwt.verify(token, key) as JwtTokenPayload;
      if (!jwtPayload || !jwtPayload.userId) throw new BadRequestException("В токене не хватает данных");
      return jwtPayload;
    } catch (error: any) {
      throw new BadRequestException(isRefresh ? "Refresh" : "Access" + " token is not valid: " + error.message);
    }
  };

  generateTokenPair = (_id: string) => {
    return {
      accessToken: this.generateToken(_id, this.ACCESS_TOKEN_SECRET, this.ACCESS_EXPIRATION_TIME),
      refreshToken: this.generateToken(_id, this.REFRESH_TOKEN_SECRET, this.REFRESH_EXPIRATION_TIME),
    };
  };
}
