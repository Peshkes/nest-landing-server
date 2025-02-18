import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { OfferService } from "../service/offer.service";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { UserAccessGuard } from "../../security/guards/group-access.guard";
import { PublicOfferDto } from "../dto/public-offer.dto";
import { OwnerOfferAccessGuard } from "../../security/guards/owner-offer-access.guard";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";
import { OwnerType } from "../offer.types";

@Controller("offer")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  //SUPER USER
  // @Get("/")
  // @UseGuards(SuperUserAccessGuard)
  // async getAllOffers() {
  //   return await this.offerService.getAllOffers();
  // }

  //2 хитрых эндпоинта и 1 особохитрый

  //NORMAL USER
  @Get("/public/:offer_id")
  async getPublicOfferByOfferId(@Param("offer_id") offer_id: string) {
    return await this.offerService.getPublicOfferByOfferId(offer_id);
  }

  @Get("/draft/:offer_id")
  @UseGuards(OwnerOfferAccessGuard)
  async getDraftOfferByOfferIdFromOwner(@Param("offer_id") offer_id: string) {
    return await this.offerService.getDraftOfferByOfferId(offer_id);
  }

  @Get("/draft/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard)
  async getDraftOfferByOfferIdFromGroup(@Param("offer_id") offer_id: string) {
    return await this.offerService.getDraftOfferByOfferId(offer_id);
  }

  @Post("/draft")
  @UseGuards(OwnerOfferAccessGuard)
  async createDraftOfferByOfferIdFromOwner(@Body() newOffer: DraftOfferDto) {
    return await this.offerService.addNewOffer(newOffer);
  }

  @Post("/draft/group/:group_id")
  @UseGuards(UserAccessGuard)
  async createDraftOfferByOfferIdFromGroup(@Body() newOffer: DraftOfferDto) {
    return await this.offerService.addNewOffer(newOffer);
  }

  @Post("/copy/:offer_id/from_group/:group_id")
  @UseGuards(UserAccessGuard, OwnerOfferAccessGuard)
  async copyOfferFromGroupToUser(@Param("offer_id") offer_id: string, @Req() req: RequestWithUser) {
    return await this.offerService.copyOfferBetweenGroupAndUser(offer_id, req.user_id, OwnerType.user);
  }

  @Post("/copy/:offer_id/to_group/:group_id")
  @UseGuards(UserAccessGuard, OwnerOfferAccessGuard)
  async copyOfferFromUserToGroup(@Param("offer_id") offer_id: string, @Param("group_id") group_id: string) {
    return await this.offerService.copyOfferBetweenGroupAndUser(offer_id, group_id, OwnerType.group);
  }

  @Post("/move/:offer_id/from_group/:group_id")
  @UseGuards(UserAccessGuard, OwnerOfferAccessGuard)
  async moveOfferFromGroupToUser(@Param("offer_id") offer_id: string, @Req() req: RequestWithUser) {
    return await this.offerService.moveOffer(offer_id, req.user_id, OwnerType.user);
  }

  @Post("/move/:offer_id/to_group/:group_id")
  @UseGuards(UserAccessGuard, OwnerOfferAccessGuard)
  async moveOfferFromUserToGroup(@Param("offer_id") offer_id: string, @Param("group_id") group_id: string) {
    return await this.offerService.moveOffer(offer_id, group_id, OwnerType.group);
  }

  @Post("/draftify/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard, OwnerOfferAccessGuard)
  async draftifyOfferFromGroup(@Param("offer_id") offer_id: string) {
    return await this.offerService.copyPublishedToDrafts(offer_id);
  }

  @Post("/draftify/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard, OwnerOfferAccessGuard)
  async draftifyOfferFromUser(@Param("offer_id") offer_id: string) {
    return await this.offerService.copyPublishedToDrafts(offer_id);
  }

  @Post("/duplicate/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard, OwnerOfferAccessGuard)
  async duplicateOfferFromGroup(@Param("offer_id") offer_id: string) {
    return await this.offerService.duplicateDraftOffer(offer_id);
  }

  @Post("/duplicate/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard, OwnerOfferAccessGuard)
  async duplicateOfferFromUser(@Param("offer_id") offer_id: string) {
    return await this.offerService.duplicateDraftOffer(offer_id);
  }

  @Post("/public")
  @UseGuards(OwnerOfferAccessGuard)
  async publishOfferByOfferIdFromOwnerWithoutDraft(@Body() newOffer: PublicOfferDto, @Req() req: RequestWithUser) {
    return await this.offerService.publishOfferWithoutDraft(newOffer, OwnerType.user, req.user_id);
  }

  @Post("/public/group/:group_id")
  @UseGuards(UserAccessGuard)
  async publishOfferByOfferIdFromGroupWithoutDraft(@Body() newOffer: PublicOfferDto, @Param("group_id") group_id: string) {
    return await this.offerService.publishOfferWithoutDraft(newOffer, OwnerType.group, group_id);
  }

  @Patch("/draft/:offer_id")
  @UseGuards(OwnerOfferAccessGuard)
  async publishDraftOfferByOfferIdFromOwner(@Param("offer_id") offer_id: string, @Body() duration: number, @Req() req: RequestWithUser) {
    return await this.offerService.publishOfferFromDraft(offer_id, OwnerType.user, req.user_id, duration);
  }

  @Patch("/draft/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard)
  async publishDraftOfferByOfferIdFromGroup(
    @Param("offer_id") offer_id: string,
    @Body() duration: number,
    @Param("group_id") group_id: string,
  ) {
    return await this.offerService.publishOfferFromDraft(offer_id, OwnerType.group, group_id, duration);
  }

  @Patch("/public/:offer_id")
  @UseGuards(OwnerOfferAccessGuard)
  async unpublishDraftOfferByOfferIdFromOwner(@Param("offer_id") offer_id: string) {
    return await this.offerService.unpublishPublicOffer(offer_id);
  }

  @Patch("/public/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard)
  async unpublishDraftOfferByOfferIdFromGroup(@Param("offer_id") offer_id: string) {
    return await this.offerService.unpublishPublicOffer(offer_id);
  }

  @Put("/draft/:offer_id")
  @UseGuards(OwnerOfferAccessGuard)
  async updateOfferByOfferIdFromOwner(@Param("offer_id") offer_id: string, @Body() newOffer: DraftOfferDto) {
    return await this.offerService.updateDraftByOfferId(offer_id, newOffer);
  }

  @Put("/draft/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard)
  async updateOfferByOfferIdFromGroup(@Param("offer_id") offer_id: string, @Body() newOffer: DraftOfferDto) {
    return await this.offerService.updateDraftByOfferId(offer_id, newOffer);
  }

  @Delete("/:offer_id")
  @UseGuards(UserAccessGuard)
  async deleteOfferByOfferIdFromOwner(@Param("offer_id") offer_id: string) {
    return await this.offerService.deleteOfferById(offer_id);
  }

  @Delete("/:offer_id/group/:group_id")
  @UseGuards(UserAccessGuard)
  async deleteOfferByOfferIdFromGroup(@Param("group_id") group_id: string) {
    return await this.offerService.deleteOfferById(group_id);
  }
}
