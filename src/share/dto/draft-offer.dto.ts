import { IsString, IsUUID } from "class-validator";
import { ID_IS_NOT_VALID, NAME_IS_NOT_STRING } from "../share-errors.constants";

export class DraftOfferDto {
  @IsString({ message: NAME_IS_NOT_STRING, always: true })
  name: string;
  body: any; //TODO Change type
  @IsUUID("4", { message: ID_IS_NOT_VALID })
  _id?: string;
}
