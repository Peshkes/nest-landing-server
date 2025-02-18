import { Module } from "@nestjs/common";
import { OfferController } from "./controller/offer.controller";
import { OfferService } from "./service/offer.service";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { DraftOfferSchema, OfferDocument, OfferSchema, PublicOfferSchema } from "./persistance/offer.schema";
import { ArchiveOfferDocument, ArchiveOfferSchema } from "./persistance/archive-offer.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ArchiveOfferDocument.name, schema: ArchiveOfferSchema }]),
    MongooseModule.forFeatureAsync([
      {
        name: OfferDocument.name,
        useFactory: () => {
          const schema = OfferSchema;
          schema.discriminator("draft", DraftOfferSchema);
          schema.discriminator("published", PublicOfferSchema);
          return schema;
        },
      },
    ]),
    SecurityModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
