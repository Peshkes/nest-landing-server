import { Request } from "express";
import { User } from "../../authentication/authentication.types";

export interface RequestWithUser extends Request {
  user?: User;
  superAccess?: boolean;
}
