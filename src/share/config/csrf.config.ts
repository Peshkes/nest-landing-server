import { doubleCsrf } from "csrf-csrf";
import crypto from "crypto";

const CSRF_TOKEN_SECRET = crypto.randomBytes(64).toString("hex");

export const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => CSRF_TOKEN_SECRET,
  size: 64,
  ignoredMethods: ["GET"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
  cookieName: "__Host-psifi.x-csrf-token",
});
