import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controller/subscription.controller";
import { SubscriptionService } from "./service/subscription.service";
import { RedisModule } from "../redis/redis.module";
import { TierModule } from "../tier/tier.module";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { PaymentDocument, PaymentSchema } from "./persistanse/payment.schema";
import { SubscriptionDocument, SubscriptionSchema } from "./persistanse/subscription.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentDocument.name, schema: PaymentSchema },
      { name: SubscriptionDocument.name, schema: SubscriptionSchema },
    ]),
    SecurityModule,
    RedisModule,
    TierModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
