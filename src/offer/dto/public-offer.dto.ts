import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { IsDate } from "class-validator";
import { NOT_DATE } from "../../share/share-errors.constants";

export class PublicOfferDto extends DraftOfferDto {
  @IsDate({ message: NOT_DATE })
  publication_date: Date;
  @IsDate({ message: NOT_DATE })
  expiration_date: Date;
  @IsDate({ message: NOT_DATE })
  update_date?: Date;
}
