import { ObjectId } from "mongoose";
import { IsString, IsUUID } from "class-validator";
import { ID_IS_NOT_VALID, NAME_IS_NOT_STRING } from "../../share/share-errors.constants";

export class BaseTierDto {
  @IsUUID("4", { message: ID_IS_NOT_VALID })
  _id?: ObjectId;
  @IsString({ message: NAME_IS_NOT_STRING, always: true })
  name: string;
  @IsString({ message: NAME_IS_NOT_STRING, always: true })
  settings: string;
}
