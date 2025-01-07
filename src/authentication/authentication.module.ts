import { Module } from "@nestjs/common";
import { AuthenticationService } from "./service/authentication.service";
import { AuthenticationController } from "./controller/authentication.controller";
import { JwtService } from "../share/services/jwt.service";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { MailService } from "../share/services/mailing.service";
import { ShareModule } from "../share/share.module";
import { SubscriptionModule } from "../subscription/subscription.module";
import { SubscriptionService } from "../subscription/service/subscription.service";

@Module({
  controllers: [AuthenticationController, UserController],
  providers: [AuthenticationService, UserService, JwtService, MailService, SubscriptionService],
  imports: [ShareModule, SubscriptionModule],
})
export class AuthenticationModule {}
