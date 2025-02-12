import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { OfferService } from "../service/offer.service";
import { OwnerAccessGuard } from "../../security/guards/owner-access.guard";
import { SuperUserAccessGuard } from "../../security/guards/super-user-access.guard";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { UserAccessGuard } from "../../security/guards/group-access.guard";

@Controller("offer")
export class OfferController {
  constructor(
    private readonly offerService: OfferService

  ) {}

  //SUPER USER
  @Get("/all_draft")
  @UseGuards(SuperUserAccessGuard)
  async getAllDraftOffers() {
    return await this.offerService.getAllDraftOffers();
  }

  @Get("/all_public")
  @UseGuards(SuperUserAccessGuard)
  async getAllPublicOffers() {
    return await this.offerService.getAllPublicOffers();
  }

  //NORMAL USER
  @Get("/:offer_id")
  async getPublicOfferByOfferId(@Param("offer_id") offer_id: string) {
    return await this.offerService.getPublicOfferByOfferId(offer_id);
  }

  @Put("/draft/:id")
  @UseGuards(OwnerAccessGuard)
  async updateDraftOfferByUserId(@Param("id") id: string, @Body() newOffer: DraftOfferDto) {
    return await this.offerService.updateDraftOfferByUserId(newOffer);
  }

  @Put("/public/:id")
  @UseGuards(OwnerAccessGuard)
  async updatePublicOfferByUserId(@Param("id") id: string, @Body() newOffer: DraftOfferDto) {
    return await this.offerService.updatePublicOfferByUserId(newOffer);
  }

  @Put("/draft/:group_id")
  @UseGuards(UserAccessGuard)
  async updateDraftOfferByGroupId(@Param("group_id") group_id: string, @Body() newOffer: DraftOfferDto) {
    return await this.offerService.updateDraftOfferByGroupId(newOffer);
  }

  @Put("/public/:group_id")
  @UseGuards(UserAccessGuard)
  async updatePublicOfferByGroupId(@Param("group_id") group_id: string, @Body() newOffer: DraftOfferDto) {
    return await this.offerService.updatePublicOfferByGroupId(newOffer);
  }
}
