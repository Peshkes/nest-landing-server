import { Module } from "@nestjs/common";
import { TierControllerBase } from "./controller/tier.controller.base";
import { TierControllerSales } from "./controller/tier.controller.sales";
import { TierServiceBase } from "./service/tier.service.base";
import { TierServiceSales } from "./service/tier.service.sales";
import { MongooseModule } from "@nestjs/mongoose";
import baseTierSchema from "./persistance/base-tier.schema";
import salesTierSchema from "./persistance/sales-tier.schema";
import { SecurityModule } from "../security/security.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "BaseTier", schema: baseTierSchema },
      { name: "SalesTier", schema: salesTierSchema },
    ]),
    SecurityModule,
  ],
  controllers: [TierControllerBase, TierControllerSales],
  providers: [TierServiceBase, TierServiceSales],
  exports: [TierServiceSales],
})
export class TierModule {}
