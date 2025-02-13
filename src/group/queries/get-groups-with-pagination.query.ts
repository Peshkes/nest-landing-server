import { Model } from "mongoose";
import { GroupAccess } from "../persistanse/group-access.schema";

export const getGroupsWithPaginationQuery = async (
  user_id: string,
  page: number,
  limit: number,
  roles: string[],
  model: Model<GroupAccess>,
) => {
  const skip = Math.max(0, page) * limit;

  const pipeline = [
    {
      $match: {
        user_id,
        ...(roles?.length ? { role: { $in: roles } } : {}),
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "group_id",
        foreignField: "_id",
        as: "group",
      },
    },
    { $unwind: "$group" },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              group_id: "$group._id",
              name: "$group.name",
              role: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        data: "$data",
        total: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
      },
    },
  ];

  const [result] = await model.aggregate(pipeline);
  return {
    data: result?.data || [],
    total: result?.total || 0,
  };
};
