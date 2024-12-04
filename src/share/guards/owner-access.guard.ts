import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import { User } from "../../authentication/authentication.types";

@Injectable()
export class OwnerAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: User = request.user;

    if (user.superUser) return true;

    const requestedId = request.params.id;

    return user._id.toString() === requestedId;
  }
}
