import { Module } from "@nestjs/common";
import { AuthenticationService } from "./service/authentication.service";
import { AuthenticationController } from "./controller/authentication.controller";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { ShareModule } from "../share/share.module";
import { MongooseModule } from "@nestjs/mongoose";
import { OfferModule } from "../offer/offer.module";
import { SecurityModule } from "../security/security.module";
import { User, UserSchema } from "./persistence/user.schema";
import { SuperUser, SuperUserSchema } from "./persistence/super-user.schema";
import { VerifyEmailToken, VerifyEmailTokenSchema } from "./persistence/verify-email-token.schema";
import { ChangePasswordToken, ChangePasswordTokenSchema } from "./persistence/change-password-token.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SuperUser.name, schema: SuperUserSchema },
      { name: VerifyEmailToken.name, schema: VerifyEmailTokenSchema },
      { name: ChangePasswordToken.name, schema: ChangePasswordTokenSchema },
    ]),
    SecurityModule,
    ShareModule,
    OfferModule,
  ],
  controllers: [AuthenticationController, UserController],
  providers: [AuthenticationService, UserService],
})
export class AuthenticationModule {}
