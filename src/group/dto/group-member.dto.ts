import { IsEmail, IsEnum, IsUUID } from "class-validator";
import { NOT_A_ROLES_ENUM, USER_ID_IS_NOT_VALID } from "../../share/share-errors.constants";
import { RoleName, Roles } from "../group.types";

export class GroupMemberDto {
  @IsEmail()
  email: string;
  @IsUUID("4", { message: USER_ID_IS_NOT_VALID })
  user_id: string;
  @IsEnum(Roles, { message: NOT_A_ROLES_ENUM })
  role: RoleName;
}
