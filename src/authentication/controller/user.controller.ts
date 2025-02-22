import { Controller, Delete, Get, Req, UseGuards } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { SuperUserAccessGuard } from "../../security/guards/super-user-access.guard";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/all")
  @UseGuards(SuperUserAccessGuard)
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get("")
  async getUser(@Req() request: RequestWithUser) {
    return await this.userService.getUser(request.user_id);
  }

  @Delete("")
  async removeUser(@Req() request: RequestWithUser) {
    await this.userService.removeUser(request.user_id);
  }
}
