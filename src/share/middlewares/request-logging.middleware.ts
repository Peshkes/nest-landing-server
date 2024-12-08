import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import chalk from "chalk";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const requestId = uuid();
    const start = performance.now();
    const now = new Date();

    const dateFormat = new Intl.DateTimeFormat("ru-RU", { year: "numeric", month: "2-digit", day: "2-digit" });
    const timeFormat = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

    const date = dateFormat.format(now);
    const time = timeFormat.format(now);

    console.log(`[${date} ${time}] [Request received: ${requestId}] [${method}] ${originalUrl}`);

    res.on("finish", () => {
      const end = performance.now();
      const responseTime = end - start;
      const statusCode = res.statusCode;

      const finishTime = new Date();
      const finishDate = dateFormat.format(finishTime);
      const finishTimeFormatted = timeFormat.format(finishTime);

      const logMessage =
        `[${finishDate} ${finishTimeFormatted}] [Request answered: ${requestId}] [${method}] ${originalUrl} ` +
        `[Status code: ${statusCode} - Response time: ${responseTime.toFixed(2)}ms]`;

      if (statusCode >= 400) {
        console.log(chalk.red(logMessage));
      } else {
        console.log(chalk.green(logMessage));
      }
    });
    next();
  }
}
