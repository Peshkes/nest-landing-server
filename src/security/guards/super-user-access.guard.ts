import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";

@Injectable()
export class SuperUserAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return !!(request.user_id && request.superAccess);
  }
}
