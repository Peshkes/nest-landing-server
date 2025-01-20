import { IsUUID } from "class-validator";
import { ID_IS_NOT_VALID } from "../../share/error.messages";
import { ObjectId } from "mongoose";

export class PaymentDto {
  @IsUUID("4", { message: ID_IS_NOT_VALID })
  id?: ObjectId;
  timestamp: number;
  amount: number;
}
