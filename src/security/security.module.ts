import { MongooseModule } from "@nestjs/mongoose";
import userSchema from "../authentication/persistence/user.schema";
import superUserSchema from "../authentication/persistence/super-user.schema";
import groupAccessSchema from "../group/persistanse/group-access.schema";
import { Module } from "@nestjs/common";
import { AdminAccessGuard, ModeratorAccessGuard, UserAccessGuard } from "./guards/group-access.guard";
import { SuperUserAccessGuard } from "./guards/super-user-access.guard";
import { OwnerAccessGuard } from "./guards/owner-access.guard";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: userSchema },
      { name: "SuperUser", schema: superUserSchema },
      { name: "GroupAccess", schema: groupAccessSchema },
    ]),
  ],
  providers: [UserAccessGuard, ModeratorAccessGuard, AdminAccessGuard, SuperUserAccessGuard, OwnerAccessGuard],
  exports: [UserAccessGuard, ModeratorAccessGuard, AdminAccessGuard, SuperUserAccessGuard, OwnerAccessGuard, MongooseModule],
})
export class SecurityModule {}
