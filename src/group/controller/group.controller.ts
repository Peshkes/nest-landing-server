import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { GroupService } from "../service/group.service";
import { OwnerAccessGuard } from "../../share/guards/owner-access.guard";
import { AdminAccessGuard, ModeratorAccessGuard, UserAccessGuard } from "../../share/guards/group-access.guard";
import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { AddGroupDto } from "../dto/add-group.dto";
import { GroupMemberDto } from "../dto/group-member.dto";
import { FullGroupData, Group, GroupAccess, GroupPreview } from "../group.types";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";

@Controller("group")
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get("/:group_id")
  @UseGuards(UserAccessGuard)
  async getGroup(@Param("group_id") group_id: string): Promise<Group> {
    return this.groupService.getGroup(group_id);
  }

  @Get("/all/:id")
  @UseGuards(OwnerAccessGuard)
  async getGroupsPreviews(@Param("id") user_id: string): Promise<GroupPreview[]> {
    return this.groupService.getGroupsPreviews(user_id);
  }

  @Post("/:id")
  @UseGuards(OwnerAccessGuard)
  async createGroup(@Param("id") user_id: string, @Body() addGroupDto: AddGroupDto): Promise<string> {
    return this.groupService.createGroup(user_id, addGroupDto);
  }

  @Post("/start/:group_id")
  @UseGuards(AdminAccessGuard)
  async startAddingMember(@Param("group_id") group_id: string, @Body() groupMember: GroupMemberDto) {
    await this.groupService.startAddingMember(group_id, groupMember);
  }

  @Post("/finish/:id/:token")
  @UseGuards(OwnerAccessGuard)
  async finishAddingMember(@Param("id") user_id: string, @Param("token") token: string) {
    await this.groupService.finishAddingMember(user_id, token);
  }

  @Post("/offer/:group_id")
  @UseGuards(UserAccessGuard)
  async createDraftOffer(@Param("group_id") group_id: string, @Body() addOfferData: DraftOfferDto): Promise<string> {
    return await this.groupService.createDraftOffer(group_id, addOfferData);
  }

  @Post("/offer/publish/:group_id")
  @UseGuards(ModeratorAccessGuard)
  async publishOfferWithoutDraft(@Param("group_id") group_id: string, @Body() offer: DraftOfferDto): Promise<string> {
    return await this.groupService.publishOfferWithoutDraft(group_id, offer);
  }

  @Put("/offer/publish/:group_id/:offer_id")
  @UseGuards(ModeratorAccessGuard)
  async publishDraftOffer(@Param("group_id") group_id: string, @Param("offer_id") offer_id: string): Promise<string> {
    return await this.groupService.publishDraftOffer(group_id, offer_id);
  }

  @Put("/offer/copy/:group_id/:id")
  @UseGuards(OwnerAccessGuard, UserAccessGuard)
  async copyOffersToUser(
    @Param("group_id") group_id: string,
    @Param("id") user_id: string,
    @Body() moveOffersRequestDto: MoveOffersRequestDto,
  ) {
    await this.groupService.copyOffersToUser(group_id, user_id, moveOffersRequestDto);
  }

  @Put("/offer/move/:group_id/:id")
  @UseGuards(OwnerAccessGuard, UserAccessGuard)
  async moveOffersToUser(
    @Param("group_id") group_id: string,
    @Param("id") user_id: string,
    @Body() moveOffersRequestDto: MoveOffersRequestDto,
  ) {
    await this.groupService.moveOffersToUser(group_id, user_id, moveOffersRequestDto);
  }

  @Put("/offer/unpublish/:group_id/:offer_id")
  @UseGuards(ModeratorAccessGuard)
  async unpublishPublicOffer(@Param("group_id") group_id: string, @Param("offer_id") offer_id: string): Promise<string> {
    return await this.groupService.unpublishPublicOffer(group_id, offer_id);
  }

  @Put("/offer/draftify/:group_id/:offer_id")
  @UseGuards(UserAccessGuard)
  async draftifyPublicOffer(@Param("group_id") group_id: string, @Param("offer_id") offer_id: string): Promise<string> {
    return await this.groupService.draftifyPublicOffer(group_id, offer_id);
  }

  @Put("/offer/:group_id/:offer_id")
  @UseGuards(UserAccessGuard)
  async duplicateDraftOffer(@Param("group_id") group_id: string, @Param("offer_id") offer_id: string): Promise<string> {
    return await this.groupService.duplicateDraftOffer(group_id, offer_id);
  }

  @Delete("/offer/:group_id/:offer_id")
  @UseGuards(ModeratorAccessGuard)
  async removeOfferFromGroup(@Param("group_id") group_id: string, @Param("offer_id") offer_id: string): Promise<DraftOfferDto> {
    return await this.groupService.removeOfferFromGroup(group_id, offer_id);
  }

  @Delete("/:group_id/:user_id")
  @UseGuards(AdminAccessGuard)
  async removeUserFromGroup(@Param("group_id") group_id: string, @Param("user_id") user_id: string): Promise<GroupAccess> {
    return await this.groupService.removeUserFromGroup(group_id, user_id);
  }

  @Delete("/:group_id")
  @UseGuards(AdminAccessGuard)
  async deleteGroup(@Param("group_id") group_id: string): Promise<FullGroupData> {
    return await this.groupService.deleteGroup(group_id);
  }
}
