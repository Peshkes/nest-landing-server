import mongoose from "mongoose";
import { UserDocument } from "../persistence/user.schema";

export const getAllPaginatedOffersQuery = async (
  userId: string,
  roles: string[],
  statuses: string[],
  page: number = 0,
  limit: number = 10,
) => {
  const pipeline: any[] = [];

  // 🔹 Список всех офферов, которые будем собирать
  const offersArrays: any[] = [];

  // === 🏠 1. Загружаем пользователя и его офферы ===
  if (roles.includes("owner")) {
    pipeline.push(
      {
        $match: { _id: userId }, // ✅ userId теперь строка (UUID)
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    );

    if (statuses.includes("public")) {
      offersArrays.push("$user.public_offers"); // Публичные офферы юзера
    }
    if (statuses.includes("draft")) {
      offersArrays.push("$user.draft_offers"); // Черновики юзера
    }
  }

  // === 🏢 2. Загружаем группы, к которым у юзера есть доступ ===
  if (roles.some((role) => ["admin", "moderator", "user"].includes(role))) {
    pipeline.push({
      $lookup: {
        from: "groupaccesses",
        let: { userId },
        pipeline: [
          { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } }, // ✅ UUID сравнивается как строка
          { $match: { role: { $in: roles } } },
          {
            $lookup: {
              from: "groups",
              localField: "group_id",
              foreignField: "_id",
              as: "group",
            },
          },
          { $unwind: "$group" },
        ],
        as: "group_access",
      },
    });

    if (statuses.includes("public")) {
      offersArrays.push("$group_access.group.public_offers"); // Публичные офферы групп
    }
    if (statuses.includes("draft")) {
      offersArrays.push("$group_access.group.draft_offers"); // Черновики групп
    }
  }

  // 🔹 Если нет статусов, берем всё
  if (statuses.length === 0) {
    offersArrays.push("$user.public_offers", "$user.draft_offers", "$group_access.group.public_offers", "$group_access.group.draft_offers");
  }

  // === 🔄 3. Объединяем все найденные офферы ===
  pipeline.push({
    $project: {
      offers: { $concatArrays: offersArrays },
    },
  });

  // === 🔄 4. Разворачиваем массив офферов ===
  pipeline.push({ $unwind: "$offers" });

  // === 🔄 5. Сортируем по дате ===
  pipeline.push({ $sort: { "offers.updatedAt": -1 } });

  // === 🔄 6. Добавляем пагинацию ===
  pipeline.push({ $skip: page * limit }, { $limit: limit });

  return await mongoose.connection.db
    .collection(UserDocument.name) // ✅ Запрос идет через коллекцию "users"
    .aggregate(pipeline)
    .toArray();
};
