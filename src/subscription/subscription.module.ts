import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controller/subscription.controller";
import { SubscriptionService } from "./service/subscription.service";
import { RedisModule } from "../redis/redis.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { TierModule } from "../tier/tier.module";

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  imports: [RedisModule, AuthenticationModule, TierModule],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
