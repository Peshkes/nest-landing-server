import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { doubleCsrfProtection } from "../config/csrf.config";

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    return doubleCsrfProtection(req, res, next);
  }
}
