import { ClientSession } from "mongoose";
import { MoveOffersRequestDto } from "../dto/move-offers-request.dto";

export interface OfferManagerService {
  addOffersIds(user_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession): Promise<void>;
}

export interface OfferManager {
  public_offers: string[];
  draft_offers: string[];
}
