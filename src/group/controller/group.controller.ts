import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { GroupService } from "../service/group.service";
import { OwnerAccessGuard } from "../../security/guards/owner-access.guard";
import { AdminAccessGuard, ModeratorAccessGuard, UserAccessGuard } from "../../security/guards/group-access.guard";
import { AddGroupDto } from "../dto/add-group.dto";
import { GroupMemberDto } from "../dto/group-member.dto";
import { FullGroupData, Group, GroupAccess, GroupPreview, GroupPreviewsPagination, GroupWithAdditionalData } from "../group.types";
import { GetGroupsPaginatedDto } from "../dto/get-groups-paginated.dto";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";

@Controller("group")
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get("/:group_id")
  @UseGuards(UserAccessGuard)
  async getGroup(@Param("group_id") group_id: string): Promise<Group> {
    return this.groupService.getGroup(group_id);
  }

  @Get("/full/:group_id")
  @UseGuards(UserAccessGuard)
  async getGroupWithAdditionalData(@Param("group_id") group_id: string): Promise<GroupWithAdditionalData> {
    return this.groupService.getGroupWithAdditionalData(group_id);
  }

  @Get("/all")
  @UseGuards(OwnerAccessGuard)
  async getGroupsPreviews(@Req() request: RequestWithUser): Promise<GroupPreview[]> {
    return this.groupService.getGroupsPreviews(request.user_id);
  }

  @Get("/paginated")
  @UseGuards(OwnerAccessGuard)
  async getPaginatedGroupsPreviews(
    @Req() request: RequestWithUser,
    @Query() query: GetGroupsPaginatedDto,
  ): Promise<GroupPreviewsPagination> {
    return this.groupService.getGroupsWithPagination(request.user_id, query.page, query.limit, query.roles);
  }

  @Post("")
  @UseGuards(OwnerAccessGuard)
  async createGroup(@Req() request: RequestWithUser, @Body() addGroupDto: AddGroupDto): Promise<string> {
    return this.groupService.createGroup(request.user_id, addGroupDto);
  }

  @Post("/start/:group_id")
  @UseGuards(AdminAccessGuard)
  async startAddingMember(@Param("group_id") group_id: string, @Body() groupMember: GroupMemberDto): Promise<void> {
    await this.groupService.startAddingMember(group_id, groupMember);
  }

  @Post("/finish/:token")
  @UseGuards(OwnerAccessGuard)
  async finishAddingMember(@Req() request: RequestWithUser, @Param("token") token: string): Promise<void> {
    await this.groupService.finishAddingMember(request.user_id, token);
  }

  @Put("/settings/:group_id")
  @UseGuards(ModeratorAccessGuard)
  async updateSettings(@Param("group_id") group_id: string, @Body() settings: object): Promise<object> {
    return await this.groupService.updateSettings(group_id, settings);
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
