import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { PasswordDto } from "../dto/password.dto";
import { EmailDto } from "../dto/email.dto";
import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { SuperUserAccessGuard } from "../../share/guards/super-user-access.guard";
import { OwnerAccessGuard } from "../../share/guards/owner-access.guard";
import { UserAccessGuard } from "../../share/guards/group-access.guard";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { SubscriptionDto } from "../../share/dto/subscription.dto";
import { GetOffersPaginatedDto } from "../dto/get-offers-paginated.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/all")
  @UseGuards(SuperUserAccessGuard)
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get("/:id")
  @UseGuards(OwnerAccessGuard)
  async getUser(@Param("id") id: string) {
    return await this.userService.getUser(id);
  }

  @Get("/offers/:id")
  @UseGuards(OwnerAccessGuard)
  async getOffersByUserId(@Param("id") id: string, @Query() query: GetOffersPaginatedDto) {
    return await this.userService.getOffersByUserId(id, query.page, query.limit, query.roles, query.statuses);
  }

  @Post("/offer/:id")
  @UseGuards(OwnerAccessGuard)
  async createDraftOffer(@Param("id") id: string, @Body() addOfferData: DraftOfferDto): Promise<string> {
    return await this.userService.createDraftOffer(id, addOfferData);
  }

  @Post("/offer/publish/:id")
  @UseGuards(OwnerAccessGuard)
  async publishOfferWithoutDraft(@Param("id") id: string, @Body() offer: DraftOfferDto): Promise<string> {
    return await this.userService.publishOfferWithoutDraft(id, offer);
  }

  @Put("/offer/publish/:id/:offer_id")
  @UseGuards(OwnerAccessGuard)
  async publishDraftOffer(@Param("id") id: string, @Param("offer_id") offer_id: string): Promise<string> {
    return await this.userService.publishDraftOffer(id, offer_id);
  }

  @Put("/:id")
  @UseGuards(OwnerAccessGuard)
  async updatePassword(@Param("id") id: string, @Body() passwordDto: PasswordDto) {
    return await this.userService.updatePassword(id, passwordDto);
  }

  @Put("/reset")
  async startResetPassword(@Param("email") @Body() email: EmailDto) {
    return await this.userService.startResetPassword(email);
  }

  @Put("/reset/:id/:token")
  async finishResetPassword(@Param("id") id: string, @Param("token") token: string, @Body() passwordDto: PasswordDto) {
    return await this.userService.finishResetPassword(id, token, passwordDto);
  }

  @Put("/copy/:id/:group_id")
  @UseGuards(OwnerAccessGuard, UserAccessGuard)
  async copyToGroup(@Param("id") id: string, @Param("group_id") group_id: string, @Body() moveOffersRequestDto: MoveOffersRequestDto) {
    await this.userService.copyToGroup(id, group_id, moveOffersRequestDto);
  }

  @Put("/move/:id/:group_id")
  @UseGuards(OwnerAccessGuard, UserAccessGuard)
  async moveToGroup(@Param("id") id: string, @Param("group_id") group_id: string, @Body() moveOffersRequestDto: MoveOffersRequestDto) {
    await this.userService.moveToGroup(id, group_id, moveOffersRequestDto);
  }

  @Put("/offer/unpublish/:id/:offer_id")
  @UseGuards(OwnerAccessGuard)
  async unpublishPublicOffer(@Param("id") id: string, @Param("offer_id") offer_id: string): Promise<string> {
    return await this.userService.unpublishPublicOffer(id, offer_id);
  }

  @Put("/offer/draftify/:id/:offer_id")
  @UseGuards(OwnerAccessGuard)
  async draftifyPublicOffer(@Param("id") id: string, @Param("offer_id") offer_id: string): Promise<string> {
    return await this.userService.draftifyPublicOffer(id, offer_id);
  }

  @Put("/offer/:id/:offer_id")
  @UseGuards(OwnerAccessGuard)
  async duplicateDraftOffer(@Param("id") id: string, @Param("offer_id") offer_id: string): Promise<string> {
    return await this.userService.duplicateDraftOffer(id, offer_id);
  }

  @Delete("/offer/:id/:offer_id")
  @UseGuards(OwnerAccessGuard)
  async removeOffer(@Param("id") id: string, @Param("offer_id") offer_id: string): Promise<DraftOfferDto> {
    return await this.userService.removeOffer(id, offer_id);
  }

  @Delete("/:id")
  @UseGuards(OwnerAccessGuard)
  async removeUser(@Param("id") id: string): Promise<void> {
    await this.userService.removeUser(id);
  }

  @Put("/subscribe/:id")
  @UseGuards(OwnerAccessGuard)
  async addSubscription(@Param("id") id: string, @Body() subscription: SubscriptionDto) {
    console.log("subscription started in user controller");
    await this.userService.addSubscription(id, subscription);
  }
}
