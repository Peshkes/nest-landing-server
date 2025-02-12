import { Module } from "@nestjs/common";
import { GroupController } from "./controller/group.controller";
import { GroupService } from "./service/group.service";
import { ShareModule } from "../share/share.module";
import { OfferModule } from "../offer/offer.module";
import { RedisModule } from "../redis/redis.module";
import { MongooseModule } from "@nestjs/mongoose";
import groupSchema from "./persistanse/group.schema";
import groupAccessSchema from "./persistanse/group-access.schema";
import { SecurityModule } from "../security/security.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Group", schema: groupSchema },
      { name: "GroupAccess", schema: groupAccessSchema },
    ]),
    SecurityModule,
    ShareModule,
    OfferModule,
    RedisModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
