import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { AuthenticationModule } from "./authentication/authentication.module";
import { GlobalExceptionFilter } from "./share/filtres/global-exception.filter";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { CsrfMiddleware } from "./share/middlewares/csrf.middleware";
import { ConfigModule } from "@nestjs/config";
import { JwtRequestMiddleware } from "./share/middlewares/jwt-request.middleware";
import { GroupModule } from "./group/group.module";
import { SuperUserAccessGuard } from "./share/guards/super-user-access.guard";
import { OwnerAccessGuard } from "./share/guards/owner-access.guard";
import { AdminAccessGuard, ModeratorAccessGuard, UserAccessGuard } from "./share/guards/group-access.guard";
import { ShareModule } from "./share/share.module";
import { RequestLoggingMiddleware } from "./share/middlewares/request-logging.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    AuthenticationModule,
    GroupModule,
    ShareModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: SuperUserAccessGuard },
    { provide: APP_GUARD, useClass: OwnerAccessGuard },
    { provide: APP_GUARD, useClass: UserAccessGuard },
    { provide: APP_GUARD, useClass: ModeratorAccessGuard },
    { provide: APP_GUARD, useClass: AdminAccessGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes("*")

      .apply(CsrfMiddleware)
      .forRoutes("*")

      .apply(JwtRequestMiddleware)
      .exclude(
        { path: "/auth/csrf", method: RequestMethod.GET },
        { path: "/auth/registration", method: RequestMethod.POST },
        { path: "/auth/refresh", method: RequestMethod.POST },
        { path: "/auth/signin", method: RequestMethod.POST },
      )
      .forRoutes("*");
  }
}
