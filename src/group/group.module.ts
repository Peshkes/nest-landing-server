import { Module } from "@nestjs/common";
import { GroupController } from "./controller/group.controller";
import { GroupService } from "./service/group.service";
import { ShareModule } from "../share/share.module";
import { OfferModule } from "../offer/offer.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { RedisModule } from "../redis/redis.module";

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [ShareModule, OfferModule, AuthenticationModule, RedisModule],
})
export class GroupModule {}
