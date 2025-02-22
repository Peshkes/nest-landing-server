import { GroupWithAdditionalData } from "../group.types";
import { Model } from "mongoose";
import { GroupDocument } from "../persistanse/group.schema";

export const getGroupWithMembersQuery = async (group_id: string, model: Model<GroupDocument>): Promise<GroupWithAdditionalData> => {
  const groupData = await model.aggregate([
    { $match: { _id: group_id } },
    {
      $lookup: {
        from: "groupaccesses",
        localField: "_id",
        foreignField: "group_id",
        as: "groupAccesses",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "groupAccesses.user_id",
        foreignField: "_id",
        as: "members",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        publicOffers: 1,
        draftOffers: 1,
        settings: 1,
        groupAccesses: {
          $map: {
            input: "$members",
            as: "member",
            in: {
              accountId: "$$member._id",
              name: "$$member.name",
              email: "$$member.email",
              role: {
                $arrayElemAt: ["$groupAccesses.role", { $indexOfArray: ["$groupAccesses.user_id", "$$member._id"] }],
              },
            },
          },
        },
      },
    },
  ]);

  return groupData[0] || null;
};
