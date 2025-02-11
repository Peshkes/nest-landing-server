import { IsDate, IsNumber, IsString } from "class-validator";
import { NOT_DATE, NOT_STRING } from "../../share/share-errors.constants";

export class PromoteTierDto {
  @IsString({ message: NOT_STRING })
  old_sales_tier: string;
  @IsString({ message: NOT_STRING })
  new_sales_tier: string;
  @IsNumber()
  duration: number;
  @IsNumber()
  total_price: number;
  @IsNumber()
  price_to_pay: number;
  @IsDate({ message: NOT_DATE })
  expiration_date: Date;
}
