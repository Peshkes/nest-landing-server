import { IsDate, IsNumber, IsString } from "class-validator";
import { NAME_IS_NOT_STRING, NOT_DATE, NOT_STRING } from "../../share/share-errors.constants";

export class SalesTierDto {
  @IsString({ message: NOT_STRING })
  _id: string;
  @IsString({ message: NAME_IS_NOT_STRING, always: true })
  name: string;
  @IsNumber()
  duration: number;
  @IsNumber()
  price: number;
  @IsString({ message: NOT_STRING })
  base_tier: string;
  @IsNumber()
  sales_price?: number;
  @IsDate({ message: NOT_DATE })
  expiration_date?: Date;
}
