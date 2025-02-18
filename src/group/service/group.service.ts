import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AddGroupDto } from "../dto/add-group.dto";
import {
  FullGroupData,
  Group,
  GroupAccess,
  GroupPreview,
  GroupWithAdditionalData,
  RoleName,
  Roles,
} from "../group.types";
import { GroupMemberDto } from "../dto/group-member.dto";
import { MailService } from "../../share/services/mailing.service";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { GroupException } from "../errors/group-exception.classes";
import { ClientSession, Model } from "mongoose";
import { runSession } from "../../share/functions/run-session";
import { RedisService } from "../../redis/service/redis.service";
import { getGroupWithMembersQuery } from "../queries/get-group-with-members.query";
import { getGroupsPreviewsQuery } from "../queries/get-groups-previews.query";
import { getGroupsWithPaginationQuery } from "../queries/get-groups-with-pagination.query";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { GroupAccessDocument } from "../persistanse/group-access.schema";
import { GroupDocument } from "../persistanse/group.schema";
import { GroupErrors } from "../errors/group-errors.class";

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupDocument.name) private readonly groupModel: Model<GroupDocument>,
    @InjectModel(GroupAccessDocument.name) private readonly groupAccessModel: Model<GroupAccessDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) {}

  // GROUP METHODS
  async getGroup(group_id: string) {
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

  async removeUserFromGroup(group_id: string, user_id: string) {
    try {
      const accessRecord = await this.findGroupAccess(group_id, user_id);
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
        this.emitRemoveAllOffers(group_id, session),
      ]);

      return { group, groupAccesses, };
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

  //EMITTER PRODUCER
  private async emitRemoveAllOffers(id: string, session: ClientSession) {
    return new Promise((resolve, reject) => {
      this.eventEmitter.emitAsync("offer.remove-all-by-owner-id", id, resolve, reject, session);
    });
  }

  //EMITTER LISTENERS
  @OnEvent("group.get-ids-by-userid-and-filters")
  async handleAddSubscriptionEvent(userId: string, filters: RoleName[], resolve: (ids: string[]) => void, reject: (message: string) => string, session: ClientSession): Promise<void> {
    try {
      const ids = await this.getGroupsIdsByUserId(userId, filters, session);
      resolve(ids);
    } catch (error){
      reject(GroupErrors.GET_IDS_BY_USER_ID + error.message);
    }
  }

  //UTILITY METHODS
  private async runGroupSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(this.groupModel, callback, customError);
  }

  private async getGroupsIdsByUserId(user_id: string, roles: RoleName[], session: ClientSession) {
    const filter: Record<string, any> = { user_id };
    if (roles.length > 0) filter.role = { $in: roles };
    const groupAccesses: GroupAccess[] = await this.groupAccessModel.find(filter).session(session);
    return groupAccesses ? groupAccesses.map(ga => ga.group_id) : [];
  }

  private async findGroupById(group_id: string, session: ClientSession = undefined) {
    const group: Group = await this.groupModel.findById(group_id).session(session);
    if (!group) throw new BadRequestException(`Группа с ID ${group_id} не найдена`);
    return group;
  }

  private async findGroupAccess(group_id: string, user_id: string) {
    const redisKey = `group-access:${group_id}:${user_id}`;
    let accessRecord = await this.redisService.getValue<GroupAccess>(redisKey);
    if (!accessRecord) {
      accessRecord = await this.groupAccessModel.findOne({ group_id, user_id });
      await this.redisService.setValue(redisKey, accessRecord, 300);
    }
    if (!accessRecord) throw new BadRequestException(`Пользователь с ID ${user_id} не состоит в группе с ID ${group_id}`);
    return accessRecord;
  }
}
