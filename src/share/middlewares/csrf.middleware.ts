import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { CsrfService } from "../services/csrf.service";

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private readonly csrfConfigService: CsrfService) {}

  use(req: Request, res: Response, next: NextFunction) {
    return this.csrfConfigService.doubleCsrfProtection(req, res, next);
  }
}
