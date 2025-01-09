import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log("Global Exception Filter");
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const message = exception.response.message.join(", ");
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    response.status(status).json({
      statusCode: status,
      message: message || "Internal server error",
    });
  }
}
