import { Module } from "@nestjs/common";
import { TierControllerBase } from "./controller/tier.controller.base";
import { TierControllerSales } from "./controller/tier.controller.sales";
import { TierServiceBase } from "./service/tier.service.base";
import { TierServiceSales } from "./service/tier.service.sales";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { BaseTierDocument, BaseTierSchema } from "./persistance/base-tier.schema";
import { SalesTierDocument, SalesTierSchema } from "./persistance/sales-tier.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BaseTierDocument.name, schema: BaseTierSchema },
      { name: SalesTierDocument.name, schema: SalesTierSchema },
    ]),
    SecurityModule,
  ],
  controllers: [TierControllerBase, TierControllerSales],
  providers: [TierServiceBase, TierServiceSales],
  exports: [TierServiceSales],
})
export class TierModule {}
