import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controller/subscription.controller";
import { SubscriptionService } from "./service/subscription.service";
import { RedisModule } from "../redis/redis.module";

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  imports: [RedisModule],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
