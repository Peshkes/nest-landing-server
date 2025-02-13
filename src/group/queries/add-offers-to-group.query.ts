import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { ClientSession, Model } from "mongoose";
import { Group } from "../persistanse/group.schema";

export async function addOffersToGroupQuery(
  group_id: string,
  moveOffersRequestDto: MoveOffersRequestDto,
  model: Model<Group>,
  session: ClientSession,
) {
  const updateFields: any = {};

  if (moveOffersRequestDto.publicOffersToMove) updateFields.public_offers = { $push: { $each: moveOffersRequestDto.publicOffersToMove } };
  if (moveOffersRequestDto.draftOffersToMove) updateFields.draft_offers = { $push: { $each: moveOffersRequestDto.draftOffersToMove } };

  await model.updateOne({ _id: group_id }, updateFields, { session });
}
