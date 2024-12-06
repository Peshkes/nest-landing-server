import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { OfferService } from "../service/offer.service";
import { OwnerAccessGuard } from "../../share/guards/owner-access.guard";
import { SuperUserAccessGuard } from "../../share/guards/super-user-access.guard";
import { DraftOfferDto } from "../dto/draft-offer.dto";
import { PublicOfferDto } from "../dto/public-offer.dto";

@Controller("offer")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post("")
  @UseGuards(OwnerAccessGuard)
  async addNewOffer(@Body() offer: DraftOfferDto) {
    return await this.offerService.addNewOffer({ name: offer.name, body: offer.body });
  }
  //     res.status(400).json({ message: "Ошибка при создании коммерческого предложения: " + error.message });

  @Get("/all_draft")
  @UseGuards(SuperUserAccessGuard)
  async getAllDraftOffers() {
    return await this.offerService.getAllDraftOffers();
  }
  //     res.status(400).json({message: error.message});

  @Get("/all_public")
  @UseGuards(SuperUserAccessGuard)
  async getAllPublicOffers() {
    return await this.offerService.getAllPublicOffers();
  }
  //     res.status(400).json({message: error.message});

  @Get("/:id")
  @UseGuards(OwnerAccessGuard)
  async getOfferById(@Param("id") id: string) {
    return await this.offerService.getOfferById(id);
  }
  //    res.status(400).json({message: error.message});

  //TODO move account
  @Delete("/public/:id")
  @UseGuards(OwnerAccessGuard)
  async deletePublicOfferById(@Param("id") id: string) {
    return await this.offerService.deletePublicOfferById(id);
  }
  //     res.status(400).json({message: error.message});

  //TODO move account
  @Delete("/draft/:id")
  @UseGuards(OwnerAccessGuard)
  async deleteDraftOfferById(@Param("id") id: string) {
    return await this.offerService.deleteDraftOfferById(id);
  }
  //     res.status(400).json({message: error.message});

  @Put("")
  @UseGuards(OwnerAccessGuard)
  async updateOfferById(@Body() newOffer: DraftOfferDto) {
    return await this.offerService.updateOfferById(newOffer);
  }
  //     res.status(400).json({message: error.message});

  @Post("/publicate")
  @UseGuards(OwnerAccessGuard)
  async publicateOffer(@Body() offerToPublicate: PublicOfferDto) {
    return await this.offerService.publicateOffer(offerToPublicate);
  }
  //     res.status(400).json({message: error.message});
}
