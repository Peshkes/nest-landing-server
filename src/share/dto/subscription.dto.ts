import { IsArray, IsBoolean, IsDate, IsString, IsUUID } from "class-validator";
import { NOT_ARRAY, NOT_BOOLEAN, NOT_DATE, NOT_STRING, SUBSCRIPTION_KEY_IS_NOT_VALID } from "../share-errors.constants";
import { PaymentDto } from "../../subscription/dto/payment.dto";

export class SubscriptionDto {
  @IsString({ message: NOT_STRING })
  tier_id: string;
  @IsUUID("4", { message: SUBSCRIPTION_KEY_IS_NOT_VALID })
  key: string;
  @IsUUID("4", { message: SUBSCRIPTION_KEY_IS_NOT_VALID })
  start_date: Date;
  @IsDate({ message: NOT_DATE })
  expiration_date: Date;
  @IsBoolean({ message: NOT_BOOLEAN })
  is_active: boolean;
  @IsArray({ message: NOT_ARRAY })
  payments: PaymentDto[];
}
