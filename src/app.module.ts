import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { AuthenticationModule } from "./authentication/authentication.module";
import { GlobalExceptionFilter } from "./filtres/global-exception.filter";
import { APP_FILTER } from "@nestjs/core";
import { CsrfMiddleware } from "./middlewares/CsrfMiddleware";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    AuthenticationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes("*");
  }
}
