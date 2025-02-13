import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controller/subscription.controller";
import { SubscriptionService } from "./service/subscription.service";
import { RedisModule } from "../redis/redis.module";
import { TierModule } from "../tier/tier.module";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { Payment, PaymentSchema } from "./persistanse/payment.schema";
import { Subscription, SubscriptionSchema } from "./persistanse/subscription.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    SecurityModule,
    RedisModule,
    TierModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
