import { Injectable } from "@nestjs/common";
import { doubleCsrf } from "csrf-csrf";
import * as crypto from "crypto";

@Injectable()
export class CsrfService {
  private readonly csrfTokenSecret: string = crypto.randomBytes(64).toString("hex");

  private readonly csrfInstance = doubleCsrf({
    getSecret: () => this.csrfTokenSecret,
    size: 64,
    ignoredMethods: ["GET"],
    getTokenFromRequest: (req) => req.headers["x-csrf-token"] as string,
    cookieName: "__Host-psifi.x-csrf-token",
  });

  get generateToken() {
    return this.csrfInstance.generateToken;
  }

  get doubleCsrfProtection() {
    return this.csrfInstance.doubleCsrfProtection;
  }
}
