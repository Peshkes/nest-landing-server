import { IsUUID } from "class-validator";
import { ObjectId } from "mongoose";
import { ID_IS_NOT_VALID } from "../../share/share-errors.constants";

export class PaymentDto {
  @IsUUID("4", { message: ID_IS_NOT_VALID })
  id?: ObjectId;
  timestamp: number;
  amount: number;
}
