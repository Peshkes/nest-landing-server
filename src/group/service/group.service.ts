import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import GroupModel from "../persistanse/group.model";
import GroupAccessModel from "../persistanse/group-access.model";
import { AddGroupDto } from "../dto/add-group.dto";
import { FullGroupData, Group, GroupAccess, GroupPreview, GroupWithAdditionalData, Roles } from "../group.types";
import { GroupMemberDto } from "../dto/group-member.dto";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { MailService } from "../../share/services/mailing.service";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OfferService } from "../../offer/service/offer.service";
import { GroupException } from "../errors/group-exception.classes";
import { UserService } from "../../authentication/service/user.service";
import { ClientSession, Promise } from "mongoose";
import { runSession } from "../../share/functions/run-session";
import { RedisService } from "../../redis/service/redis.service";
import { getGroupWithMembersQuery } from "../queries/get-group-with-members.query";
import { getGroupsPreviewsQuery } from "../queries/get-groups-previews.query";
import { getGroupsWithPaginationQuery } from "../queries/get-groups-with-pagination.query";
import { ManageOfferFunctions } from "../../share/functions/manage-offer-functions";
import { OfferManagerService } from "../../share/interfaces/offer-manager";
import { addOffersToGroupQuery } from "../queries/add-offers-to-group.query";

@Injectable()
export class GroupService implements OfferManagerService {
  constructor(
    private readonly mailService: MailService,
    private readonly offerService: OfferService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  // GROUP METHODS
  async getGroup(group_id: string): Promise<Group> {
    try {
      const group = await this.findGroupById(group_id);
      return {
        _id: group._id,
        name: group.name,
        draft_offers: group.draft_offers,
        public_offers: group.public_offers,
        settings: group.settings,
      };
    } catch (error: any) {
      throw GroupException.GetGroupException(error.message, error.statusCode);
    }
  }

  async getGroupWithAdditionalData(group_id: string): Promise<GroupWithAdditionalData> {
    try {
      const groupData = await getGroupWithMembersQuery(group_id);
      if (!groupData) throw new BadRequestException("Группа не найдена");

      return groupData;
    } catch (error: any) {
      throw GroupException.GetGroupWithAdditionalDataException(error.message);
    }
  }

  async getGroupsPreviews(user_id: string): Promise<GroupPreview[]> {
    try {
      return await getGroupsPreviewsQuery(user_id);
    } catch (error: any) {
      throw GroupException.GetGroupsPreviewsException(error.message, error.statusCode);
    }
  }

  async getGroupsWithPagination(
    user_id: string,
    page: number,
    limit: number,
    roles: string[],
  ): Promise<{ data: GroupPreview[]; total: number }> {
    try {
      return await getGroupsWithPaginationQuery(user_id, page, limit, roles);
    } catch (error) {
      throw GroupException.GetGroupsWithPagination(error.message, error.statusCode);
    }
  }

  async createGroup(user_id: string, addGroupDto: AddGroupDto): Promise<string> {
    return this.runGroupSession(async (session) => {
      const createdGroup = await new GroupModel({
        name: addGroupDto.name,
      }).save({ session });

      await new GroupAccessModel({
        group_id: createdGroup._id,
        user_id,
        role: Roles.admin.name,
      }).save({ session });

      return createdGroup._id;
    }, GroupException.CreateGroupException);
  }

  async startAddingMember(group_id: string, groupMember: GroupMemberDto): Promise<void> {
    try {
      await this.findGroupById(group_id);
      const existingMember = await GroupAccessModel.findOne({ group_id, user_id: groupMember.user_id });
      if (existingMember) throw new BadRequestException("Пользователь уже является участником группы");

      const token = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
      await Promise.all([
        this.redisService.setValue(
          token,
          JSON.stringify({
            group_id,
            user_id: groupMember.user_id,
            role: groupMember.role,
          }),
        ),
        this.sendAddMemberEmail(groupMember.email, group_id, token),
      ]);
    } catch (error) {
      throw GroupException.StartAddingMemberException(error.message, error.statusCode);
    }
  }

  private async sendAddMemberEmail(email: string, userId: string, token: string) {
    const link = `localhost:27000/group/finish/${userId}/${token}`;
    await this.mailService.sendMailWithHtmlFromNoReply(
      email,
      "Запрос на добавление в группу",
      `<b>Для сброса пароля пожалуйста пройдите по <a href="${link && link}">этой ссылке</a></b>`,
    );
  }

  async finishAddingMember(user_id: string, token: string): Promise<void> {
    try {
      const addRecord = JSON.parse(await this.redisService.getValue(token));
      if (!addRecord) throw new BadRequestException("Токен для добавления некорректен или истек");

      await Promise.all([
        new GroupAccessModel({
          group_id: addRecord.group_id,
          user_id,
          role: addRecord.role,
        }).save(),
        await this.redisService.deleteValue(token),
      ]);
    } catch (error: any) {
      throw GroupException.FinishAddingMemberException(error.message, error.statusCode);
    }
  }

  async removeUserFromGroup(group_id: string, user_id: string): Promise<GroupAccess> {
    try {
      const accessRecord = await GroupAccessModel.findOne({ group_id, user_id });
      if (!accessRecord) throw new BadRequestException(`Пользователь с ID ${user_id} не состоит в группе с ID ${group_id}`);
      if (accessRecord.role === Roles.admin.name)
        throw new BadRequestException(`Невозможно удалить администратора группы с ID ${group_id}`);

      await GroupAccessModel.deleteOne({ group_id, user_id });
      return accessRecord;
    } catch (error: any) {
      throw GroupException.DeleteUserException(error.message, error.statusCode);
    }
  }

  async deleteGroup(group_id: string): Promise<FullGroupData> {
    return this.runGroupSession(async (session) => {
      const [group, groupAccesses] = await Promise.all([
        GroupModel.findById(group_id).session(session),
        GroupAccessModel.find({ group_id }).session(session),
      ]);

      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

      await Promise.all([
        GroupAccessModel.deleteMany({ group_id }).session(session),
        GroupModel.findByIdAndDelete(group_id).session(session),
      ]);

      return {
        group: {
          _id: group._id,
          name: group.name,
          draftOffers: group.draft_offers,
          publicOffers: group.public_offers,
          settings: group.settings,
        },
        groupAccesses,
      };
    }, GroupException.DeleteGroupException);
  }

  async updateSettings(group_id: string, settings: object) {
    try {
      const updatedGroup = await GroupModel.findByIdAndUpdate(group_id, { settings }, { new: true });

      if (!updatedGroup) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);
      return updatedGroup.settings;
    } catch (error) {
      throw GroupException.UpdateSettingsException(error.message, error.statusCode);
    }
  }

  // OFFER MANAGER METHODS
  async createDraftOffer(group_id: string, addOfferData: DraftOfferDto): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.createDraftOffer(this.offerService, GroupModel, group_id, addOfferData, session);
    }, GroupException.CreateDraftException);
  }

  async publishOfferWithoutDraft(group_id: string, offer: DraftOfferDto): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.publishOfferWithoutDraft(this.offerService, GroupModel, group_id, offer, session);
    }, GroupException.PublishOfferWithoutDraftException);
  }

  async publishDraftOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.publishDraftOffer(this.offerService, GroupModel, group_id, offer_id, session);
    }, GroupException.PublishDraftException);
  }

  async copyOffersToUser(group_id: string, user_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.copyOffersToAnotherEntity(
        this.offerService,
        GroupModel,
        group_id,
        user_id,
        this.userService,
        moveOffersRequestDto,
        session,
      );
    }, GroupException.CopyOfferToUserException);
  }

  async moveOffersToUser(group_id: string, user_id: string, moveOffersRequestDto: MoveOffersRequestDto): Promise<void> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.moveOffersToAnotherEntity(
        this.offerService,
        GroupModel,
        group_id,
        user_id,
        this.userService,
        moveOffersRequestDto,
        session,
      );
    }, GroupException.MoveOfferToUserException);
  }

  async unpublishPublicOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.unpublishPublicOffer(this.offerService, GroupModel, group_id, offer_id, session);
    }, GroupException.UnpublishPublicException);
  }

  async draftifyPublicOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.draftifyPublicOffer(this.offerService, GroupModel, group_id, offer_id, session);
    }, GroupException.DraftifyPublicException);
  }

  async duplicateDraftOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.duplicateDraftOffer(this.offerService, GroupModel, group_id, offer_id, session);
    }, GroupException.DuplicateDraftException);
  }

  async removeOfferFromGroup(group_id: string, offer_id: string): Promise<DraftOfferDto> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.removeOfferFromEntity(this.offerService, GroupModel, group_id, offer_id, session);
    }, GroupException.DeleteDraftOfferException);
  }

  async addOffersIds(user_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession) {
    await addOffersToGroupQuery(user_id, moveOffersRequestDto, session);
  }

  //UTILITY METHODS
  private async runGroupSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(GroupModel, callback, customError);
  }

  private async findGroupById(group_id: string, session: ClientSession = undefined) {
    const group = await GroupModel.findById(group_id).session(session);
    if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);
    return group;
  }
}
