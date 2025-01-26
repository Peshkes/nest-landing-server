import { IsEnum, IsNumber, IsObject, IsString, ValidateNested } from "class-validator";
import { NOT_ONE_OF_PAYMENT_STATUS_VALUES, NOT_STRING } from "../../share/share-errors.constants";
import { PaymentStatus } from "./payment-status.enum";
import { Type } from "class-transformer";
import { PayerDto } from "./payer.dto";
import { DetailsDto } from "./details.dto";

export declare class RefundDto {
  @IsString({ message: NOT_STRING })
  key: string;
  @IsString({ message: NOT_STRING })
  transaction_id: string;
  @IsEnum(PaymentStatus, { message: NOT_ONE_OF_PAYMENT_STATUS_VALUES })
  status: string;
  @IsString({ message: NOT_STRING })
  payment_method: string;
  @IsNumber()
  timestamp: number;
  @IsNumber()
  sum: number;
  @IsObject()
  @ValidateNested()
  @Type(() => PayerDto)
  payer: PayerDto;
  @IsObject()
  @ValidateNested()
  @Type(() => DetailsDto)
  details: DetailsDto;
  @IsString({ message: NOT_STRING })
  description: string;
}
