import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { IsInt, IsString, Min } from "class-validator";
import { NAME_IS_NOT_STRING, NOT_STRING } from "../../share/share-errors.constants";

export class PublicOfferDto extends DraftOfferDto {
  @IsString({ message: NAME_IS_NOT_STRING })
  name: string;
  body: Record<string, any>;
  @IsString({ message: NOT_STRING })
  owner_id: string;
  @IsInt()
  @Min(0)
  duration: number;
}
