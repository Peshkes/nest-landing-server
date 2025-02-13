import { Module } from "@nestjs/common";
import { GroupController } from "./controller/group.controller";
import { GroupService } from "./service/group.service";
import { ShareModule } from "../share/share.module";
import { OfferModule } from "../offer/offer.module";
import { RedisModule } from "../redis/redis.module";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { GroupAccess, GroupAccessSchema } from "./persistanse/group-access.schema";
import { Group, GroupSchema } from "./persistanse/group.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: GroupAccess.name, schema: GroupAccessSchema },
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
