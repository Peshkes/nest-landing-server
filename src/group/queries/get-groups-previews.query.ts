import { GroupAccess, GroupPreview } from "../group.types";
import { Model } from "mongoose";

export const getGroupsPreviewsQuery = async (user_id: string, model: Model<GroupAccess>): Promise<GroupPreview[]> => {
  return model.aggregate([
    { $match: { user_id } },
    {
      $lookup: {
        from: "groups",
        localField: "groups_id",
        foreignField: "_id",
        as: "group",
      },
    },
    { $unwind: "$group" },
    {
      $project: {
        group_id: "$group._id",
        name: "$group.name",
        role: "$role",
      },
    },
  ]);
};
