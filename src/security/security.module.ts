import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../authentication/persistence/user.schema";
import { SuperUser, SuperUserSchema } from "../authentication/persistence/super-user.schema";
import { GroupAccess, GroupAccessSchema } from "../group/persistanse/group-access.schema";
import { Module } from "@nestjs/common";
import { AdminAccessGuard, ModeratorAccessGuard, UserAccessGuard } from "./guards/group-access.guard";
import { SuperUserAccessGuard } from "./guards/super-user-access.guard";
import { OwnerAccessGuard } from "./guards/owner-access.guard";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SuperUser.name, schema: SuperUserSchema },
      { name: GroupAccess.name, schema: GroupAccessSchema },
    ]),
  ],
  providers: [UserAccessGuard, ModeratorAccessGuard, AdminAccessGuard, SuperUserAccessGuard, OwnerAccessGuard],
  exports: [UserAccessGuard, ModeratorAccessGuard, AdminAccessGuard, SuperUserAccessGuard, OwnerAccessGuard, MongooseModule],
})
export class SecurityModule {}
