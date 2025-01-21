import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import GroupModel from "../persistanse/group.model";
import GroupAccessModel from "../persistanse/group-access.model";
import { AddGroupDto } from "../dto/add-group.dto";
import { FullGroupData, Group, GroupAccess, Roles } from "../group.types";
import { GroupMemberDto } from "../dto/group-member.dto";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { MailService } from "../../share/services/mailing.service";
import AddUserToGroupTokenModel from "../persistanse/add-user-to-group-token.model";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OfferService } from "../../offer/service/offer.service";
import { GroupException } from "../errors/group-exception.classes";
import { UserService } from "../../authentication/service/user.service";
import { ClientSession } from "mongoose";
import { runSession } from "../../share/functions/run-session";

@Injectable()
export class GroupService {
  constructor(
    private readonly mailService: MailService,
    private readonly offerService: OfferService,
    private readonly userService: UserService,
  ) {}

  async getGroup(group_id: string): Promise<Group> {
    try {
      const group = await this.findGroupById(group_id);
      return {
        _id: group._id,
        name: group.name,
        draftOffers: group.draft_offers,
        publicOffers: group.public_offers,
        settings: group.settings,
      };
    } catch (error: any) {
      throw GroupException.GetGroupException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getGroupsPreviews(user_id: string) {
    try {
      // const groupAccessRecords = await GroupAccessModel.find({ user_id });
      // if (!groupAccessRecords || groupAccessRecords.length === 0) throw new Error("У пользователя нет групп");
      //
      // const groupIds = groupAccessRecords.map((record) => record.group_id);
      // const groups = await GroupModel.find({ _id: { $in: groupIds } });
      // if (!groups || groups.length === 0) throw new Error("У пользователя нет групп");
      //
      // return groupAccessRecords
      //   .map((record) => {
      //     const group = groups.find((g) => g._id.toString() === record.group_id.toString());
      //
      //     if (group) {
      //       return {
      //         group_id: group._id,
      //         name: group.name,
      //         role: record.role,
      //       };
      //     }
      //     return null;
      //   })
      //   .filter((item) => item !== null);
      return await GroupAccessModel.aggregate([
        { $match: { user_id } },
        {
          $lookup: {
            from: "groups",
            localField: "groups_id",
            foreignField: "_id",
            as: "group",
          },
        },
        { $unwind: "$group" },
        {
          $project: {
            group_id: "$group._id",
            name: "$group.name",
            role: "$role",
          },
        },
      ]);
    } catch (error: any) {
      throw GroupException.GetGroupsPreviewsException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
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
        role: Roles.ADMIN,
      }).save({ session });

      return createdGroup._id;
    }, GroupException.CreateGroupException);
  }

  async startAddingMember(group_id: string, groupMember: GroupMemberDto): Promise<void> {
    return this.runGroupSession(async (session) => {
      await this.findGroupById(group_id, session);
      const existingMember = await GroupAccessModel.findOne({ group_id, user_id: groupMember.user_id });
      if (existingMember) {
        throw new BadRequestException("Пользователь уже является участником группы");
      }
      const token = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
      await new AddUserToGroupTokenModel({
        group_id,
        token,
        user_id: groupMember.user_id,
        role: groupMember.role,
      }).save();

      await this.sendAddMemberEmail(groupMember.email, group_id, token);
    }, GroupException.StartAddingMemberException);
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
    return this.runGroupSession(async (session) => {
      const addRecord = await AddUserToGroupTokenModel.findOne({ token }).session(session);
      if (!addRecord) throw new BadRequestException("Токен для добавления некорректен или истек");

      if (!(await bcrypt.compare(token, addRecord.token))) throw new BadRequestException("Токен для добавления некорректен или истек");

      await new GroupAccessModel({
        group_id: addRecord.group_id,
        user_id,
        role: addRecord.role,
      }).save({ session });

      await AddUserToGroupTokenModel.deleteOne({ _id: addRecord._id }).session(session);
    }, GroupException.FinishAddingMemberException);
  }

  async createDraftOffer(group_id: string, addOfferData: DraftOfferDto): Promise<string> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);

      const draftOfferId = await this.offerService.addNewOffer(addOfferData, session);
      group.draft_offers.push(draftOfferId);

      await group.save({ session });
      return draftOfferId;
    }, GroupException.CreateDraftException);
  }

  async publishOfferWithoutDraft(group_id: string, offer: DraftOfferDto): Promise<string> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const publicOfferId = await this.offerService.publishOfferWithoutDraft(offer, session);
      group.public_offers.push(publicOfferId);

      await group.save({ session });
      return publicOfferId;
    }, GroupException.PublishOfferWithoutDraftException);
  }

  async publishDraftOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const publicOfferId = await this.offerService.publishOfferFromDraft(offer_id, session);
      group.public_offers.push(publicOfferId);
      group.draft_offers = group.draft_offers.filter((draftId) => draftId !== offer_id);

      await group.save({ session });
      return publicOfferId;
    }, GroupException.PublishDraftException);
  }

  async copyOffersToUser(group_id: string, user_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const newPublicOfferIds: string[] = [];
      const newDraftOfferIds: string[] = [];

      if (moveOffersRequestDto.publicOffersToMove?.length) {
        const publicOffersToCopy = moveOffersRequestDto.publicOffersToMove.filter((offerId) => group.public_offers.includes(offerId));
        const newOfferIds = await this.offerService.duplicatePublicOffers(publicOffersToCopy, session);
        newPublicOfferIds.push(...newOfferIds);
      }

      if (moveOffersRequestDto.draftOffersToMove?.length) {
        const draftOffersToCopy = moveOffersRequestDto.draftOffersToMove.filter((offerId) => group.draft_offers.includes(offerId));
        const newOfferIds = await this.offerService.duplicateDraftOffers(draftOffersToCopy, session);
        newDraftOfferIds.push(...newOfferIds);
      }

      await this.userService.addOffersIdsToUser(
        user_id,
        { publicOffersToMove: newPublicOfferIds, draftOffersToMove: newDraftOfferIds },
        session,
      );

      return { newPublicOfferIds, newDraftOfferIds };
    }, GroupException.CopyOfferToUserException);
  }

  async moveOffersToUser(group_id: string, user_id: string, moveOffersRequestDto: MoveOffersRequestDto): Promise<void> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const publicOffersToMove: string[] = [];
      const draftOffersToMove: string[] = [];

      group.public_offers = group.public_offers.filter((offerId) => {
        if (moveOffersRequestDto.publicOffersToMove?.includes(offerId)) {
          publicOffersToMove.push(offerId);
          return false;
        }
        return true;
      });

      group.draft_offers = group.draft_offers.filter((offerId) => {
        if (moveOffersRequestDto.draftOffersToMove?.includes(offerId)) {
          draftOffersToMove.push(offerId);
          return false;
        }
        return true;
      });

      await this.userService.addOffersIdsToUser(user_id, { publicOffersToMove, draftOffersToMove }, session);

      await group.save({ session });
    }, GroupException.MoveOfferToUserException);
  }

  async unpublishPublicOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const draftOfferId = await this.offerService.unpublishPublicOffer(offer_id, session);
      group.draft_offers.push(draftOfferId);
      group.public_offers = group.draft_offers.filter((draftId) => draftId !== offer_id);

      await group.save({ session });
      return draftOfferId;
    }, GroupException.UnpublishPublicException);
  }

  async draftifyPublicOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const draftOfferId = await this.offerService.draftifyPublicOffer(offer_id, session);
      group.draft_offers.push(draftOfferId);

      await group.save({ session });
      return draftOfferId;
    }, GroupException.DraftifyPublicException);
  }

  async duplicateDraftOffer(group_id: string, offer_id: string): Promise<string> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const draftOfferId = await this.offerService.duplicateDraftOffer(offer_id, session);
      group.draft_offers.push(draftOfferId);

      await group.save({ session });
      return draftOfferId;
    }, GroupException.DuplicateDraftException);
  }

  async removeOfferFromGroup(group_id: string, offer_id: string): Promise<DraftOfferDto> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const draftOffer = await this.offerService.deleteDraftOfferById(offer_id, session);
      group.public_offers = group.draft_offers.filter((draftId) => draftId !== offer_id);

      await group.save({ session });
      return draftOffer;
    }, GroupException.DeleteDraftOfferException);
  }

  async removeUserFromGroup(group_id: string, user_id: string): Promise<GroupAccess> {
    try {
      const accessRecord = await GroupAccessModel.findOne({ group_id, user_id });
      if (!accessRecord) throw new BadRequestException(`Пользователь с ID ${user_id} не состоит в группе с ID ${group_id}`);
      if (accessRecord.role === Roles.ADMIN) throw new BadRequestException(`Невозможно удалить администратора группы с ID ${group_id}`);

      await GroupAccessModel.deleteOne({ group_id, user_id });
      return accessRecord;
    } catch (error: any) {
      throw GroupException.DeleteUserException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteGroup(group_id: string): Promise<FullGroupData> {
    return this.runGroupSession(async (session) => {
      const group = await this.findGroupById(group_id, session);
      const groupAccesses = await GroupAccessModel.find({ group_id }).session(session);

      await GroupAccessModel.deleteMany({ group_id }).session(session);
      await GroupModel.findByIdAndDelete(group_id).session(session);

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
      const group = await this.findGroupById(group_id);
      group.settings = settings;
      group.save();
      return settings;
    } catch (error) {
      throw GroupException.UpdateSettingsException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
