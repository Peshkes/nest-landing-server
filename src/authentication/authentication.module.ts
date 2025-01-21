import { Module } from "@nestjs/common";
import { AuthenticationService } from "./service/authentication.service";
import { AuthenticationController } from "./controller/authentication.controller";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { ShareModule } from "../share/share.module";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
  controllers: [AuthenticationController, UserController],
  providers: [AuthenticationService, UserService],
  imports: [ShareModule, SubscriptionModule],
  exports: [UserService],
})
export class AuthenticationModule {}
