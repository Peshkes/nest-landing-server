import { ObjectId } from "mongoose";
import { IsDate, IsString, IsUUID } from "class-validator";
import { ID_IS_NOT_VALID, NAME_IS_NOT_STRING, NOT_DATE } from "../../share/share-errors.constants";

export class SalesTierDto {
  @IsUUID("4", { message: ID_IS_NOT_VALID })
  _id?: ObjectId;
  @IsString({ message: NAME_IS_NOT_STRING, always: true })
  name: string;
  duration: number;
  price: number;
  base_tier: string;
  sales_price?: number;
  @IsDate({ message: NOT_DATE })
  expiration_date?: Date;
}
