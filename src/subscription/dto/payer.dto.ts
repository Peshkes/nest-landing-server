import { IsString } from "class-validator";
import { NOT_STRING } from "../../share/share-errors.constants";

export class PayerDto {
  @IsString({ message: NOT_STRING })
  name: string;
  @IsString({ message: NOT_STRING })
  email: string;
  @IsString({ message: NOT_STRING })
  phone: string;
}
