import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AddGroupDto } from "../dto/add-group.dto";
import { FullGroupData, GroupPreview, GroupWithAdditionalData, Roles } from "../group.types";
import { GroupMemberDto } from "../dto/group-member.dto";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { MailService } from "../../share/services/mailing.service";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OfferService } from "../../offer/service/offer.service";
import { GroupException } from "../errors/group-exception.classes";
import { ClientSession, Model } from "mongoose";
import { runSession } from "../../share/functions/run-session";
import { RedisService } from "../../redis/service/redis.service";
import { getGroupWithMembersQuery } from "../queries/get-group-with-members.query";
import { getGroupsPreviewsQuery } from "../queries/get-groups-previews.query";
import { getGroupsWithPaginationQuery } from "../queries/get-groups-with-pagination.query";
import { ManageOfferFunctions } from "../../share/functions/manage-offer-functions";
import { OfferManagerService } from "../../share/interfaces/offer-manager";
import { addOffersToGroupQuery } from "../queries/add-offers-to-group.query";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { GroupAccess } from "../persistanse/group-access.schema";
import { Group } from "../persistanse/group.schema";

@Injectable()
export class GroupService implements OfferManagerService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(GroupAccess.name) private readonly groupAccessModel: Model<GroupAccess>,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
    private readonly offerService: OfferService,
    private readonly redisService: RedisService,
  ) {}

  // GROUP METHODS
  async getGroup(group_id: string): Promise<Group> {
    try {
      return await this.findGroupById(group_id);
    } catch (error: any) {
      throw GroupException.GetGroupException(error.message, error.statusCode);
    }
  }

  async getGroupWithAdditionalData(group_id: string): Promise<GroupWithAdditionalData> {
    try {
      const groupData = await getGroupWithMembersQuery(group_id, this.groupModel);
      if (!groupData) throw new BadRequestException("Группа не найдена");

      return groupData;
    } catch (error: any) {
      throw GroupException.GetGroupWithAdditionalDataException(error.message);
    }
  }

  async getGroupsPreviews(user_id: string): Promise<GroupPreview[]> {
    try {
      return await getGroupsPreviewsQuery(user_id, this.groupAccessModel);
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
      return await getGroupsWithPaginationQuery(user_id, page, limit, roles, this.groupAccessModel);
    } catch (error) {
      throw GroupException.GetGroupsWithPagination(error.message, error.statusCode);
    }
  }

  async createGroup(user_id: string, addGroupDto: AddGroupDto): Promise<string> {
    return this.runGroupSession(async (session) => {
      const createdGroup = await new this.groupModel({
        name: addGroupDto.name,
      }).save({ session });

      await new this.groupAccessModel({
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
      const existingMember = await this.groupAccessModel.findOne({ group_id, user_id: groupMember.user_id });
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

      const mongoPromise = new this.groupAccessModel({
        group_id: addRecord.group_id,
        user_id,
        role: addRecord.role,
      }).save();
      const redisPromise = this.redisService.deleteValue(token);
      await Promise.all([mongoPromise, redisPromise]);
    } catch (error: any) {
      throw GroupException.FinishAddingMemberException(error.message, error.statusCode);
    }
  }

  async removeUserFromGroup(group_id: string, user_id: string): Promise<GroupAccess> {
    try {
      const accessRecord = await this.groupAccessModel.findOne({ group_id, user_id });
      if (!accessRecord) throw new BadRequestException(`Пользователь с ID ${user_id} не состоит в группе с ID ${group_id}`);
      if (accessRecord.role === Roles.admin.name)
        throw new BadRequestException(`Невозможно удалить администратора группы с ID ${group_id}`);

      await this.groupAccessModel.deleteOne({ group_id, user_id });
      return accessRecord;
    } catch (error: any) {
      throw GroupException.DeleteUserException(error.message, error.statusCode);
    }
  }

  async deleteGroup(group_id: string): Promise<FullGroupData> {
    return this.runGroupSession(async (session) => {
      const [group, groupAccesses] = await Promise.all([
        this.groupModel.findById(group_id).session(session),
        this.groupAccessModel.find({ group_id }).session(session),
      ]);

      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

      await Promise.all([
        this.groupAccessModel.deleteMany({ group_id }).session(session),
        this.groupModel.findByIdAndDelete(group_id).session(session),
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
      const updatedGroup = await this.groupModel.findByIdAndUpdate(group_id, { settings }, { new: true });

      if (!updatedGroup) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);
      return updatedGroup.settings;
    } catch (error) {
      throw GroupException.UpdateSettingsException(error.message, error.statusCode);
    }
  }

  // OFFER MANAGER METHODS
  async createDraftOffer(group_id: string, addOfferData: DraftOfferDto): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.createDraftOffer(this.offerService, this.groupModel, group_id, addOfferData, session);
    }, GroupException.CreateDraftException);
  }

  async publishOfferWithoutDraft(group_id: string, offer: DraftOfferDto): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.publishOfferWithoutDraft(this.offerService, this.groupModel, group_id, offer, session);
    }, GroupException.PublishOfferWithoutDraftException);
  }

  async publishDraftOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.publishDraftOffer(this.offerService, this.groupModel, group_id, offer_id, session);
    }, GroupException.PublishDraftException);
  }

  async copyOffersToUser(group_id: string, user_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.copyOffersToAnotherEntity(
        this.offerService,
        this.groupModel,
        group_id,
        user_id,
        moveOffersRequestDto,
        this.emitAddOffersToUserEvent,
        session,
      );
    }, GroupException.CopyOfferToUserException);
  }

  async moveOffersToUser(group_id: string, user_id: string, moveOffersRequestDto: MoveOffersRequestDto): Promise<void> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.moveOffersToAnotherEntity(
        this.groupModel,
        group_id,
        user_id,
        moveOffersRequestDto,
        this.emitAddOffersToUserEvent,
        session,
      );
    }, GroupException.MoveOfferToUserException);
  }

  async unpublishPublicOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.unpublishPublicOffer(this.offerService, this.groupModel, group_id, offer_id, session);
    }, GroupException.UnpublishPublicException);
  }

  async draftifyPublicOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.draftifyPublicOffer(this.offerService, this.groupModel, group_id, offer_id, session);
    }, GroupException.DraftifyPublicException);
  }

  async duplicateDraftOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.duplicateDraftOffer(this.offerService, this.groupModel, group_id, offer_id, session);
    }, GroupException.DuplicateDraftException);
  }

  async removeOfferFromGroup(group_id: string, offer_id: string): Promise<DraftOfferDto> {
    return this.runGroupSession(async (session) => {
      return await ManageOfferFunctions.removeOfferFromEntity(this.offerService, this.groupModel, group_id, offer_id, session);
    }, GroupException.DeleteDraftOfferException);
  }

  async addOffersIds(user_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession) {
    await addOffersToGroupQuery(user_id, moveOffersRequestDto, this.groupModel, session);
  }

  //EMITTER PRODUCERS
  private async emitAddOffersToUserEvent(
    user_id: string,
    moveOffersRequestDto: MoveOffersRequestDto,
    session: ClientSession,
  ): Promise<void> {
    return new Promise((resolve) => {
      this.eventEmitter.emitAsync("user.add-offers-ids", user_id, moveOffersRequestDto, resolve, session);
    });
  }

  //EMITTER LISTENERS
  @OnEvent("group.add-offers-ids")
  async handleAddOffersIds(group_id: string, moveOffersRequestDto: MoveOffersRequestDto, callback: () => void, session: ClientSession) {
    await this.addOffersIds(group_id, moveOffersRequestDto, session);
    callback();
  }

  //UTILITY METHODS
  private async runGroupSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(this.groupModel, callback, customError);
  }

  private async findGroupById(group_id: string, session: ClientSession = undefined) {
    const group = await this.groupModel.findById(group_id).session(session);
    if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);
    return group;
  }
}
