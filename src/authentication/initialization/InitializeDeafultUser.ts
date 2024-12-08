import bcrypt from "bcryptjs";
import userModel from "../persistence/userModel";
import UserModel from "../persistence/userModel";
import { Roles } from "../authentication.types";

export const createAdminUser = async () => {
  if (!(await userModel.exists({ name: "admin" }))) {
    const password = await bcrypt.hash("12345678Vv!", 10);
    try {
      await UserModel.create({
        superUser: true,
        name: "admin",
        email: "admin@gmail.com",
        password: password,
        role: Roles.ADMIN,
        lastPasswords: [],
        subscription: "admin",
        publicOffers: [],
        draftOffers: [],
      });
      console.log("Админ успешно создан");
    } catch (error: any) {
      throw new Error(`Ошибка при создании пользователя: ${error.message}`);
    }
  }
};
