import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controller/subscription.controller";
import { SubscriptionService } from "./service/subscription.service";

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
