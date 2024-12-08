import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { CsrfService } from "../services/csrf.service";
import chalk from "chalk";

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private readonly csrfService: CsrfService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    if (method === "GET") return next();

    const csrfTokenHeader = req.headers["x-csrf-token"];
    if (!csrfTokenHeader) {
      console.error(chalk.red(`[CSRF Middleware] Missing CSRF token in the request header`));
      return res.status(400).send("CSRF token missing in headers");
    }

    let csrfTokenCookie: string;
    try {
      csrfTokenCookie = req.cookies["__Host-psifi.x-csrf-token"];
      if (!csrfTokenCookie) {
        console.error(chalk.red(`[CSRF Middleware] Missing CSRF token in cookies`));
        return res.status(400).send("CSRF token missing in cookies");
      }
    } catch (error: any) {
      console.error(chalk.red(`[CSRF Middleware] Error parsing CSRF token cookie: ${error.message}`));
      return res.status(400).send("Error parsing CSRF token cookie");
    }

    this.csrfService.doubleCsrfProtection(req, res, (err: any) => {
      if (err) {
        console.error(chalk.red(`[CSRF Middleware] Error: CSRF check failed for ${method} ${originalUrl} - ${err.message || err}`));
        return res.status(403).send("Forbidden by CSRF");
      } else next();
    });
  }
}
