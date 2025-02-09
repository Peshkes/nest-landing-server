import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import GroupAccessModel from "../../group/persistanse/group-access.model";
import { RoleInfo, RoleName, Roles } from "../../group/group.types";

export class GroupAccessGuard implements CanActivate {
  constructor(readonly minRole: RoleInfo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.superAccess) return true;

    const groupId = request.params.group_id;
    if (!groupId) return false;

    const role = await this.getClientRole(request.user._id.toString(), groupId);
    return role && Roles[role].weight >= this.minRole.weight;
  }

  protected async getClientRole(user_id: string, group_id: string): Promise<RoleName | null> {
    try {
      const groupAccess = await GroupAccessModel.findOne({ user_id, group_id });
      return groupAccess.role;
    } catch (error) {
      console.error("Ошибка при получении роли:", error);
      return null;
    }
  }
}

@Injectable()
export class UserAccessGuard extends GroupAccessGuard {
  constructor() {
    super(Roles.user);
  }
}

@Injectable()
export class ModeratorAccessGuard extends GroupAccessGuard {
  constructor() {
    super(Roles.moderator);
  }
}

@Injectable()
export class AdminAccessGuard extends GroupAccessGuard {
  constructor() {
    super(Roles.admin);
  }
}
