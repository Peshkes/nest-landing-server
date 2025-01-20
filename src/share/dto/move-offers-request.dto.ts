import { IsArray, IsOptional, IsUUID } from "class-validator";

export class MoveOffersRequestDto {
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  publicOffersToMove?: Array<string>;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  draftOffersToMove?: Array<string>;
}
