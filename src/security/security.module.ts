import { MongooseModule } from "@nestjs/mongoose";
import { UserDocument, UserSchema } from "../authentication/persistence/user.schema";
import { SuperUserDocument, SuperUserSchema } from "../authentication/persistence/super-user.schema";
import { GroupAccessDocument, GroupAccessSchema } from "../group/persistanse/group-access.schema";
import { Module } from "@nestjs/common";
import { AdminAccessGuard, ModeratorAccessGuard, UserAccessGuard } from "./guards/group-access.guard";
import { SuperUserAccessGuard } from "./guards/super-user-access.guard";
import { OwnerAccessGuard } from "./guards/owner-access.guard";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: SuperUserDocument.name, schema: SuperUserSchema },
      { name: GroupAccessDocument.name, schema: GroupAccessSchema },
    ]),
    RedisModule,
  ],
  providers: [UserAccessGuard, ModeratorAccessGuard, AdminAccessGuard, SuperUserAccessGuard, OwnerAccessGuard],
  exports: [UserAccessGuard, ModeratorAccessGuard, AdminAccessGuard, SuperUserAccessGuard, OwnerAccessGuard, MongooseModule],
})
export class SecurityModule {}
