import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { IsInt, Min } from "class-validator";

export class PublicOfferDto extends DraftOfferDto {
  @IsInt()
  @Min(0)
  duration: number;
}
