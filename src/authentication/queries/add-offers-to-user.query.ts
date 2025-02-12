import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { ClientSession } from "mongoose";
import UserModel from "../persistence/user.schema";

export async function addOffersToUserQuery(user_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession) {
  const updateFields: any = {};

  if (moveOffersRequestDto.publicOffersToMove) updateFields.public_offers = { $push: { $each: moveOffersRequestDto.publicOffersToMove } };
  if (moveOffersRequestDto.draftOffersToMove) updateFields.draft_offers = { $push: { $each: moveOffersRequestDto.draftOffersToMove } };

  await UserModel.updateOne({ _id: user_id }, updateFields, { session });
}
