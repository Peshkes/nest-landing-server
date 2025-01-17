import { IsString } from "class-validator";
import { NAME_IS_NOT_STRING } from "../../share/share-errors.constants";

export class AddGroupDto {
  @IsString({ message: NAME_IS_NOT_STRING })
  name: string;
}
