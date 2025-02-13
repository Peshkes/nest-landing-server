import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";
import { RoleInfo, RoleName, Roles } from "../../group/group.types";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GroupAccessDocument } from "../../group/persistanse/group-access.schema";

export class GroupAccessGuard implements CanActivate {
  constructor(
    readonly minRole: RoleInfo,
    readonly model: Model<GroupAccessDocument>,
  ) {}

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
      const groupAccess = await this.model.findOne({ user_id, group_id });
      return groupAccess.role;
    } catch (error) {
      console.error("Ошибка при получении роли:", error);
      return null;
    }
  }
}

@Injectable()
export class UserAccessGuard extends GroupAccessGuard {
  constructor(@InjectModel(GroupAccessDocument.name) private readonly groupAccessModel: Model<GroupAccessDocument>) {
    super(Roles.user, groupAccessModel);
  }
}

@Injectable()
export class ModeratorAccessGuard extends GroupAccessGuard {
  constructor(@InjectModel(GroupAccessDocument.name) private readonly groupAccessModel: Model<GroupAccessDocument>) {
    super(Roles.moderator, groupAccessModel);
  }
}

@Injectable()
export class AdminAccessGuard extends GroupAccessGuard {
  constructor(@InjectModel(GroupAccessDocument.name) private readonly groupAccessModel: Model<GroupAccessDocument>) {
    super(Roles.admin, groupAccessModel);
  }
}
