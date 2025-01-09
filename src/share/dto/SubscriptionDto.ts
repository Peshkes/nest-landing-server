import { PaymentDto } from "../../subscription/dto/PaymentDto";

export class SubscriptionDto {
  //@IsUUID("4", { message: ID_IS_NOT_VALID })
  key: string;
  tierId: string;
  //@IsDate({ message: NOT_DATE })
  startDate: Date;
  isActive: boolean;
  payments: PaymentDto[];
  expirationDate: Date;
}
