import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { ClientSession } from "mongoose";
import GroupModel from "../persistanse/group.schema";

export async function addOffersToGroupQuery(group_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession) {
  const updateFields: any = {};

  if (moveOffersRequestDto.publicOffersToMove) updateFields.public_offers = { $push: { $each: moveOffersRequestDto.publicOffersToMove } };
  if (moveOffersRequestDto.draftOffersToMove) updateFields.draft_offers = { $push: { $each: moveOffersRequestDto.draftOffersToMove } };

  await GroupModel.updateOne({ _id: group_id }, updateFields, { session });
}
