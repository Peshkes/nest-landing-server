import { Module } from "@nestjs/common";
import { TierControllerBase } from "./controller/tier.controller.base";
import { TierControllerSales } from "./controller/tier.controller.sales";
import { TierServiceBase } from "./service/tier.service.base";
import { TierServiceSales } from "./service/tier.service.sales";

@Module({
  controllers: [TierControllerBase, TierControllerSales],
  providers: [TierServiceBase, TierServiceSales],
})
export class TierModule {}
