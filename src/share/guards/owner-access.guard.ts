import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestWithUser } from "../interfaces/request-with-user.interface";

@Injectable()
export class OwnerAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.superAccess) return true;
    return request.user._id.toString() === request.params.id;
  }
}
