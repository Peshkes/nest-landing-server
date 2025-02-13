import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { ClientSession, Model } from "mongoose";
import { UserDocument } from "../persistence/user.schema";

export async function addOffersToUserQuery(
  user_id: string,
  moveOffersRequestDto: MoveOffersRequestDto,
  model: Model<UserDocument>,
  session: ClientSession,
) {
  const updateFields: any = {};

  if (moveOffersRequestDto.publicOffersToMove) updateFields.public_offers = { $push: { $each: moveOffersRequestDto.publicOffersToMove } };
  if (moveOffersRequestDto.draftOffersToMove) updateFields.draft_offers = { $push: { $each: moveOffersRequestDto.draftOffersToMove } };

  await model.updateOne({ _id: user_id }, updateFields, { session });
}
