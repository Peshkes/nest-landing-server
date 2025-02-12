import { Module } from "@nestjs/common";
import { OfferController } from "./controller/offer.controller";
import { OfferService } from "./service/offer.service";
import { MongooseModule } from "@nestjs/mongoose";
import draftOfferSchema from "./persistance/draft-offer.schema";
import publicOfferSchema from "./persistance/public-offer.schema";
import { SecurityModule } from "../security/security.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "DraftOffer", schema: draftOfferSchema },
      { name: "PublicOffer", schema: publicOfferSchema },
    ]),
    SecurityModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
