import { Module } from "@nestjs/common";
import { OfferController } from "./controller/offer.controller";
import { OfferService } from "./service/offer.service";

@Module({
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
