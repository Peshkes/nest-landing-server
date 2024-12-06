import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import { Roles, User } from "../../authentication/authentication.types";
import GroupAccessModel from "../../group/persistanse/groupAccessModel";

@Injectable()
export class GroupAccessGuard implements CanActivate {
  constructor(readonly minRole: Roles) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: User = request.user;

    if (user.superUser) return true;

    const groupId = request.params.id;
    if (!groupId) return false;

    const role = await this.getClientRole(user._id.toString(), groupId);
    return role && role >= this.minRole;
  }

  protected async getClientRole(accountId: string, groupId: string): Promise<Roles | null> {
    try {
      const groupAccess = await GroupAccessModel.findOne(
        {
          [`groups.${groupId}.account_id`]: accountId,
        },
        {
          [`groups.${groupId}.$`]: 1,
        },
      );

      if (groupAccess && groupAccess.groups) {
        const group = groupAccess.groups.get(groupId);
        if (group && group[0]) return group[0].role;
      }

      return null;
    } catch (error) {
      console.error("Ошибка при получении роли:", error);
      return null;
    }
  }
}
