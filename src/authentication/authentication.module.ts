import { Module } from "@nestjs/common";
import { AuthenticationService } from "./service/authentication.service";
import { AuthenticationController } from "./controller/authentication.controller";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { ShareModule } from "../share/share.module";
import { MongooseModule } from "@nestjs/mongoose";
import userSchema from "./persistence/user.schema";
import superUserSchema from "./persistence/super-user.schema";
import verifyEmailTokenSchema from "./persistence/verify-email-token.schema";
import changePasswordTokenSchema from "./persistence/change-password-token.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: userSchema },
      { name: "SuperUser", schema: superUserSchema },
      { name: "VerifyEmailToken", schema: verifyEmailTokenSchema },
      { name: "ChangePasswordToken", schema: changePasswordTokenSchema },
    ]),
    ShareModule,
  ],
  controllers: [AuthenticationController, UserController],
  providers: [AuthenticationService, UserService],
})
export class AuthenticationModule {}
