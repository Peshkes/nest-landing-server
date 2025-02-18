import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";
import { GroupAccess, RoleInfo, RoleName, Roles } from "../../group/group.types";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GroupAccessDocument } from "../../group/persistanse/group-access.schema";
import { RedisService } from "../../redis/service/redis.service";

export class GroupAccessGuard implements CanActivate {
  constructor(
    readonly minRole: RoleInfo,
    readonly model: Model<GroupAccessDocument>,
    readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.superAccess) return true;

    const groupId = request.params.group_id;
    if (!groupId) return false;

    const role = await this.getClientRole(request.user_id, groupId);
    return role && Roles[role].weight >= this.minRole.weight;
  }

  protected async getClientRole(user_id: string, group_id: string): Promise<RoleName | null> {
    try {
      const redisKey = `group-access:${group_id}:${user_id}`;
      let groupAccess = await this.redisService.getValue<GroupAccess>(redisKey);
      if (!groupAccess) {
        groupAccess = await this.model.findOne({ user_id, group_id });
        await this.redisService.setValue(redisKey, groupAccess, 300);
      }
      return groupAccess.role;
    } catch (error) {
      console.error("Ошибка при получении роли:", error);
      return null;
    }
  }
}

@Injectable()
export class UserAccessGuard extends GroupAccessGuard {
  constructor(
    @InjectModel(GroupAccessDocument.name) readonly groupAccessModel: Model<GroupAccessDocument>,
    readonly redisService: RedisService,
  ) {
    super(Roles.user, groupAccessModel, redisService);
  }
}

@Injectable()
export class ModeratorAccessGuard extends GroupAccessGuard {
  constructor(
    @InjectModel(GroupAccessDocument.name) private readonly groupAccessModel: Model<GroupAccessDocument>,
    readonly redisService: RedisService,
  ) {
    super(Roles.moderator, groupAccessModel, redisService);
  }
}

@Injectable()
export class AdminAccessGuard extends GroupAccessGuard {
  constructor(
    @InjectModel(GroupAccessDocument.name) private readonly groupAccessModel: Model<GroupAccessDocument>,
    readonly redisService: RedisService,
  ) {
    super(Roles.admin, groupAccessModel, redisService);
  }
}
