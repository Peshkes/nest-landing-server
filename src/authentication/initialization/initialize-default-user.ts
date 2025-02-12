import bcrypt from "bcryptjs";
import SuperUserModel from "../persistence/super-user.schema";

export const createAdminUser = async () => {
  if (!(await SuperUserModel.exists({ name: "admin" }))) {
    const password = await bcrypt.hash("12345678Vv!", 10);
    try {
      await SuperUserModel.create({
        name: "admin",
        email: "admin@gmail.com",
        password: password,
        lastPasswords: [],
      });
      console.log("Админ успешно создан");
    } catch (error: any) {
      throw new Error(`Ошибка при создании пользователя: ${error.message}`);
    }
  }
};
