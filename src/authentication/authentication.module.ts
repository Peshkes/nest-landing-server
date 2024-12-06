import { Module } from "@nestjs/common";
import { AuthenticationService } from "./service/authentication.service";
import { AuthenticationController } from "./controller/authentication.controller";
import { JwtService } from "../share/services/jwt.service";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { MailService } from "../share/services/mailing.service";

@Module({
  controllers: [AuthenticationController, UserController],
  providers: [AuthenticationService, UserService, JwtService, MailService],
})
export class AuthenticationModule {}
