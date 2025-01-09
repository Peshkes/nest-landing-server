import { Body, Controller, Delete, Get, Param, Put, UseGuards } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { PasswordDto } from "../dto/password.dto";
import { EmailDto } from "../dto/email.dto";
import { MoveOffersRequestDto } from "../dto/move-offers-request.dto";
import { SuperUserAccessGuard } from "../../share/guards/super-user-access.guard";
import { OwnerAccessGuard } from "../../share/guards/owner-access.guard";
import { UserAccessGuard } from "../../share/guards/group-access.guard";
import { SubscriptionDto } from "../../share/dto/SubscriptionDto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/all")
  @UseGuards(SuperUserAccessGuard)
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get("/:object")
  @UseGuards(OwnerAccessGuard)
  async getUser(@Param("object") object: string) {
    return await this.userService.getUser(object);
  }

  @Delete("/:id")
  @UseGuards(OwnerAccessGuard)
  async removeUser(@Param("id") id: string) {
    return await this.userService.removeUser(id);
  }

  @Put("/:object")
  @UseGuards(OwnerAccessGuard)
  async updatePassword(@Param("object") object: string, @Body() passwordDto: PasswordDto) {
    return await this.userService.updatePassword(object, passwordDto);
  }

  @Put("/reset")
  async startResetPassword(@Param("email") @Body() email: EmailDto) {
    return await this.userService.startResetPassword(email);
  }

  @Put("/reset/:id/:token")
  async finishResetPassword(@Param("id") id: string, @Param("token") token: string, @Body() passwordDto: PasswordDto) {
    return await this.userService.finishResetPassword(id, token, passwordDto);
  }

  @Put("/copy/:group_id")
  @UseGuards(UserAccessGuard)
  async copyToGroup(@Param("group_id") group_id: string, @Body() moveOffersRequestDto: MoveOffersRequestDto) {
    await this.userService.copyToGroup(group_id, moveOffersRequestDto);
  }

  @Put("/copy/:group_id")
  @UseGuards(UserAccessGuard)
  async moveToGroup(@Param("group_id") group_id: string, @Body() moveOffersRequestDto: MoveOffersRequestDto) {
    await this.userService.moveToGroup(group_id, moveOffersRequestDto);
  }

  @Put("/subscribe/:id")
  @UseGuards(OwnerAccessGuard)
  async addSubscription(@Param("id") id: string, @Body() subscription: SubscriptionDto) {
    console.log("subscription started in user controller");
    await this.userService.addSubscription(id, subscription);
  }
}
