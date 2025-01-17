import { BadRequestException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { RuntimeException } from "@nestjs/core/errors/exceptions";
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

@Injectable()
export class GroupService {
  constructor(
    private readonly mailService: MailService,
    private readonly offerService: OfferService,
    private readonly userService: UserService,
  ) {}

  async getGroup(group_id: string) {
    try {
      const group: Group = await GroupModel.findById(group_id);
      if (!group) throw new NotFoundException(`Группа с ID ${group_id} не найдена`);
      return group;
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

  async createGroup(user_id: string, addGroupDto: AddGroupDto) {
    const session = await GroupModel.startSession();

    try {
      session.startTransaction();

      const createdGroup = await new GroupModel({
        name: addGroupDto.name,
      }).save({ session });

      await new GroupAccessModel({
        group_id: createdGroup._id,
        user_id,
        role: Roles.ADMIN,
      }).save({ session });

      await session.commitTransaction();
      return createdGroup._id;
    } catch (error: any) {
      await session.abortTransaction();
      throw GroupException.CreateGroupException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async startAddingMember(group_id: string, groupMember: GroupMemberDto) {
    try {
      const token = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
      await new AddUserToGroupTokenModel({
        group_id,
        token,
        user_id: groupMember.user_id,
        role: groupMember.role,
      }).save();

      await this.sendAddMemberEmail(groupMember.email, group_id, token);
    } catch (error: any) {
      throw GroupException.StartAddingMemberException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
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
    const session = await GroupAccessModel.startSession();

    try {
      session.startTransaction();

      const addRecord = await AddUserToGroupTokenModel.findOne({ user_id }).session(session);
      if (!addRecord) throw new BadRequestException("Токен для добавления некорректен или истек");

      if (!(await bcrypt.compare(token, addRecord.token))) throw new BadRequestException("Токен для добавления некорректен или истек");

      await new GroupAccessModel({
        group_id: addRecord.group_id,
        user_id,
        role: addRecord.role,
      }).save({ session });

      await AddUserToGroupTokenModel.deleteOne({ _id: addRecord._id }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw GroupException.FinishAddingMemberException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async createDraftOffer(group_id: string, addOfferData: DraftOfferDto) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();

      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new RuntimeException(`Группа с ID ${group_id} не найдена`);

      const draftOfferId = await this.offerService.addNewOffer(addOfferData, session);
      group.draft_offers.push(draftOfferId);

      await group.save({ session });
      await session.commitTransaction();
      return draftOfferId;
    } catch (error) {
      await session.abortTransaction();
      throw GroupException.CreateDraftException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async publishOfferWithoutDraft(group_id: string, offer: DraftOfferDto) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();
      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

      const publicOfferId = await this.offerService.publishOfferWithoutDraft(offer, session);
      group.public_offers.push(publicOfferId);

      await group.save({ session });
      await session.commitTransaction();
      return publicOfferId;
    } catch (error) {
      await session.abortTransaction();
      throw GroupException.PublishOfferWithoutDraftException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async publishDraftOffer(group_id: string, offer_id: string) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();
      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

      const publicOfferId = await this.offerService.publishOfferFromDraft(offer_id, session);
      group.public_offers.push(publicOfferId);
      group.draft_offers = group.draft_offers.filter((draftId) => draftId !== offer_id);

      await group.save({ session });
      await session.commitTransaction();
      return publicOfferId;
    } catch (error) {
      await session.abortTransaction();
      throw GroupException.PublishDraftException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async copyOffersToUser(group_id: string, user_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();

      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

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

      await session.commitTransaction();
      return { newPublicOfferIds, newDraftOfferIds }; // Возвращаем новые ID
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async moveOffersToUser(group_id: string, user_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();

      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

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
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async unpublishPublicOffer(group_id: string, offer_id: string) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();
      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

      const draftOfferId = await this.offerService.unpublishPublicOffer(offer_id, session);
      group.draft_offers.push(draftOfferId);
      group.public_offers = group.draft_offers.filter((draftId) => draftId !== offer_id);

      await group.save({ session });
      await session.commitTransaction();
      return draftOfferId;
    } catch (error) {
      await session.abortTransaction();
      throw GroupException.UnpublishPublicException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async draftifyPublicOffer(group_id: string, offer_id: string) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();
      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

      const draftOfferId = await this.offerService.draftifyPublicOffer(offer_id, session);
      group.draft_offers.push(draftOfferId);

      await group.save({ session });
      await session.commitTransaction();
      return draftOfferId;
    } catch (error) {
      await session.abortTransaction();
      throw GroupException.DraftifyPublicException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async duplicateDraftOffer(group_id: string, offer_id: string) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();
      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

      const draftOfferId = await this.offerService.duplicateDraftOffer(offer_id, session);
      group.draft_offers.push(draftOfferId);

      await group.save({ session });
      await session.commitTransaction();
      return draftOfferId;
    } catch (error) {
      await session.abortTransaction();
      throw GroupException.DraftifyPublicException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async removeOfferFromGroup(group_id: string, offer_id: string) {
    const session = await GroupModel.startSession();
    try {
      session.startTransaction();
      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);

      const draftOffer = await this.offerService.deleteDraftOfferById(offer_id, session);
      group.public_offers = group.draft_offers.filter((draftId) => draftId !== offer_id);

      await group.save({ session });
      await session.commitTransaction();
      return draftOffer;
    } catch (error) {
      await session.abortTransaction();
      throw GroupException.UnpublishPublicException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
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
    const session = await GroupModel.startSession();

    try {
      session.startTransaction();

      const group = await GroupModel.findById(group_id).session(session);
      if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);
      const groupAccesses = await GroupAccessModel.find({ group_id }).session(session);

      await GroupAccessModel.deleteMany({ group_id }).session(session);
      await GroupModel.deleteOne({ _id: group_id }).session(session);

      await session.commitTransaction();
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
    } catch (error: any) {
      await session.abortTransaction();
      throw GroupException.DeleteGroupException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }
}
