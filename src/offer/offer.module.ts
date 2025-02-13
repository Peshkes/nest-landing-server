import { Module } from "@nestjs/common";
import { OfferController } from "./controller/offer.controller";
import { OfferService } from "./service/offer.service";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { DraftOffer, DraftOfferSchema } from "./persistance/draft-offer.schema";
import { PublicOffer, PublicOfferSchema } from "./persistance/public-offer.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DraftOffer.name, schema: DraftOfferSchema },
      { name: PublicOffer.name, schema: PublicOfferSchema },
    ]),
    SecurityModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
