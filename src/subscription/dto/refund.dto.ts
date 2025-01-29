import { IsEnum, IsNumber, IsString } from "class-validator";
import { NOT_OBJECT, NOT_ONE_OF_PAYMENT_STATUS_VALUES, NOT_STRING } from "../../share/share-errors.constants";
import { PaymentStatus } from "./payment-status.enum";
import { PaymentSystems } from "./payment-systems.enum";

export declare class RefundDto {
  @IsString({ message: NOT_STRING })
  payment_id: string;
  @IsString({ message: NOT_STRING })
  key: string;
  @IsNumber()
  sum: number;
  @IsEnum(PaymentStatus, { message: NOT_ONE_OF_PAYMENT_STATUS_VALUES })
  status: string;
  @IsString({ message: NOT_STRING })
  payment_system: PaymentSystems;
  @IsString({ message: NOT_STRING })
  transaction_id: string;
  @IsString({ message: NOT_STRING })
  description: string;
  @Object({ message: NOT_OBJECT })
  payment_details: object;

  // @IsNumber()
  // timestamp: number;
  // @IsObject()
  // @ValidateNested()
  // @Type(() => PayerDto)
  // payer: PayerDto;
  // @IsObject()
  // @ValidateNested()
  // @Type(() => DetailsDto)
  // details: DetailsDto;
  // @IsString({ message: NOT_STRING })
  // description: string;
}
