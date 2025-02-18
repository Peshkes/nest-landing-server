import { Module } from "@nestjs/common";
import { AuthenticationService } from "./service/authentication.service";
import { AuthenticationController } from "./controller/authentication.controller";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { ShareModule } from "../share/share.module";
import { MongooseModule } from "@nestjs/mongoose";
import { SecurityModule } from "../security/security.module";
import { UserDocument, UserSchema } from "./persistence/user.schema";
import { SuperUserDocument, SuperUserSchema } from "./persistence/super-user.schema";
import { VerifyEmailTokenDocument, VerifyEmailTokenSchema } from "./persistence/verify-email-token.schema";
import { ChangePasswordTokenDocument, ChangePasswordTokenSchema } from "./persistence/change-password-token.schema";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: SuperUserDocument.name, schema: SuperUserSchema },
      { name: VerifyEmailTokenDocument.name, schema: VerifyEmailTokenSchema },
      { name: ChangePasswordTokenDocument.name, schema: ChangePasswordTokenSchema },
    ]),
    SecurityModule,
    ShareModule,
    RedisModule,
  ],
  controllers: [AuthenticationController, UserController],
  providers: [AuthenticationService, UserService],
})
export class AuthenticationModule {}
