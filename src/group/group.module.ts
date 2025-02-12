import { Module } from "@nestjs/common";
import { GroupController } from "./controller/group.controller";
import { GroupService } from "./service/group.service";
import { ShareModule } from "../share/share.module";
import { OfferModule } from "../offer/offer.module";
import { RedisModule } from "../redis/redis.module";
import { MongooseModule } from "@nestjs/mongoose";
import groupSchema from "./persistanse/group.schema";
import groupAccessSchema from "./persistanse/group-access.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Group", schema: groupSchema },
      { name: "GroupAccess", schema: groupAccessSchema },
    ]),
    ShareModule,
    OfferModule,
    RedisModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
