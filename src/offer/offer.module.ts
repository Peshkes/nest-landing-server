import { Module } from "@nestjs/common";
import { OfferController } from "./controller/offer.controller";
import { OfferService } from "./service/offer.service";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { OfferDocument, OfferSchema } from "./persistance/offer.schema";
import { ArchiveOfferDocument, ArchiveOfferSchema } from "./persistance/archive-offer.schema";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ArchiveOfferDocument.name, schema: ArchiveOfferSchema },
      { name: OfferDocument.name, schema: OfferSchema },
    ]),
    SecurityModule,
    RedisModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
