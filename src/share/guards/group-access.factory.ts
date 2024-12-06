import { GroupAccessGuard } from "./group-access.guard";
import { Roles } from "../../authentication/authentication.types";

export const RoleGuardFactory = (minRole: Roles) => {
  class RoleGuard extends GroupAccessGuard {
    constructor() {
      super(minRole);
    }

    public async getClientRole(accountId: string, groupId: string): Promise<Roles | null> {
      return await super.getClientRole(accountId, groupId);
    }
  }
  return RoleGuard;
};

export const UserAccessGuard = RoleGuardFactory(Roles.USER);
export const ModeratorAccessGuard = RoleGuardFactory(Roles.MODERATOR);
export const AdminAccessGuard = RoleGuardFactory(Roles.ADMIN);
