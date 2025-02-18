import { PaymentSystems } from "../share.types";
import { IsDefined, IsNotEmpty, IsUUID } from "class-validator";

export class AddSubscriptionDto {
  @IsUUID()
  tier_id: string;
  @IsDefined()
  @IsNotEmpty()
  payment_system: PaymentSystems;
}
