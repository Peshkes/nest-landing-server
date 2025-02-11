import GroupAccessModel from "../persistanse/group-access.schema";
import { GroupPreview } from "../group.types";

export const getGroupsPreviewsQuery = async (user_id: string): Promise<GroupPreview[]> => {
  return GroupAccessModel.aggregate([
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
