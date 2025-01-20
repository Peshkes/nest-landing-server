import { Module } from "@nestjs/common";
import { GroupController } from "./controller/group.controller";
import { GroupService } from "./service/group.service";
import { OfferService } from "../offer/service/offer.service";
import { UserService } from "../authentication/service/user.service";
import { MailService } from "../share/services/mailing.service";

@Module({
  controllers: [GroupController],
  providers: [GroupService, MailService, UserService, OfferService],
})
export class GroupModule {}
