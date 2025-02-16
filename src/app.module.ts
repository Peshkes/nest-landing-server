import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { AuthenticationModule } from "./authentication/authentication.module";
import { GlobalExceptionFilter } from "./share/filtres/global-exception.filter";
import { APP_FILTER } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { CsrfMiddleware } from "./security/middlewares/csrf.middleware";
import { ConfigModule } from "@nestjs/config";
import { JwtRequestMiddleware } from "./security/middlewares/jwt-request.middleware";
import { GroupModule } from "./group/group.module";
import { ShareModule } from "./share/share.module";
import { RequestLoggingMiddleware } from "./share/middlewares/request-logging.middleware";
import { OfferModule } from "./offer/offer.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { TierModule } from "./tier/tier.module";
import { RedisModule } from "./redis/redis.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SecurityModule } from "./security/security.module";
import { NeuroModule } from "./neuro/neuro.module";

/*
DESCRIPTION

Main modules: Authentication, Group, Subscription
Service modules: Share, Tier, Redis, Offer

Connections:
  Main <-> Main via emitter
  Main -> Service via DI
*/

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    EventEmitterModule.forRoot(),

    AuthenticationModule,
    SubscriptionModule,
    SecurityModule,
    GroupModule,
    OfferModule,
    RedisModule,
    ShareModule,
    NeuroModule,
    TierModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
  exports: [MongooseModule],
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
        { path: "/auth/super/signin", method: RequestMethod.POST },
      )
      .forRoutes("*");
  }
}
