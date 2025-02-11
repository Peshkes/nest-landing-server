import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controller/subscription.controller";
import { SubscriptionService } from "./service/subscription.service";
import { RedisModule } from "../redis/redis.module";
import { TierModule } from "../tier/tier.module";
import { MongooseModule } from "@nestjs/mongoose";
import paymentsSchema from "./persistanse/payment.schema";
import subscriptionSchema from "./persistanse/subscription.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Payment", schema: paymentsSchema },
      { name: "Subscription", schema: subscriptionSchema },
    ]),
    RedisModule,
    TierModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})

export class SubscriptionModule {}
