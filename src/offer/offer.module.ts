import { Module } from "@nestjs/common";
import { OfferController } from "./controller/offer.controller";
import { OfferService } from "./service/offer.service";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { DraftOfferDocument, DraftOfferSchema } from "./persistance/draft-offer.schema";
import { PublicOfferDocument, PublicOfferSchema } from "./persistance/public-offer.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DraftOfferDocument.name, schema: DraftOfferSchema },
      { name: PublicOfferDocument.name, schema: PublicOfferSchema },
    ]),
    SecurityModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
