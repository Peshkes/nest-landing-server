import { Request } from "express";

export interface RequestWithUser extends Request {
  user_id?: string;
  superAccess?: boolean;
}
