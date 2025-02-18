import { IsString } from "class-validator";
import { NAME_IS_NOT_STRING } from "../share-errors.constants";

export class DraftUnpublishedOfferDto {
  @IsString({ message: NAME_IS_NOT_STRING, always: true })
  name: string;
  body: any; //TODO Change type
}
