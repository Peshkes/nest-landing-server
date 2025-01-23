import { IsDate, IsString } from "class-validator";
import { NAME_IS_NOT_STRING, NOT_DATE } from "../../share/share-errors.constants";

export class SalesTierDto {
  @IsString({ message: NAME_IS_NOT_STRING, always: true })
  name: string;
  duration: number;
  price: number;
  base_tier: string;
  sales_price?: number;
  @IsDate({ message: NOT_DATE })
  expiration_date?: Date;
}
