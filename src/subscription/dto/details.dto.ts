import { IsString } from "class-validator";
import { NOT_STRING } from "../../share/share-errors.constants";

export class DetailsDto {
  @IsString({ message: NOT_STRING })
  card_type: string;
  @IsString({ message: NOT_STRING })
  card_last4: string;
  @IsString({ message: NOT_STRING })
  exp_month: string;
  @IsString({ message: NOT_STRING })
  exp_year: string;
}
