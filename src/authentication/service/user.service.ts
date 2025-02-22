import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ClientSession, Model } from "mongoose";
import { runSession } from "../../share/functions/run-session";
import { UserException } from "../error/user-exception.class";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { UserDocument } from "../persistence/user.schema";
import { User } from "../authentication.types";
import { RedisService } from "../../redis/service/redis.service";
import { UserErrors } from "../error/user-errors.class";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  //USER METHODS
  async getAllUsers() {
    try {
      return await this.userModel.find();
    } catch (error: any) {
      throw UserException.GetAllUsersException(error.message, error.statusCode);
    }
  }

  async getUser(id: string) {
    try {
      let user = await this.redisService.getValue<User>(`user:${id}`);
      if (!user) user = await this.userModel.findById(id);
      if (!user) throw new BadRequestException("Пользователь не найден");
      else await this.redisService.setValue(`user:${user._id}`, user, 300);
      return { email: user.email, name: user.name, _id: user._id };
    } catch (error: any) {
      throw UserException.GetUserException(error.message, error.statusCode);
    }
  }

  async removeUser(id: string) {
    return this.runUserSession(async (session) => {
      const account: User | null = await this.userModel.findByIdAndDelete(id);
      if (!account) throw new BadRequestException("Пользователь не найден");
      await this.emitRemoveAllOffers(id, session);
      return { email: account.email, name: account.name, _id: account._id };
    }, UserException.RemoveUserException);
  }

  async addSubscription(user_id: string, subscription_id: string, session: ClientSession) {
    await this.userModel.updateOne({ id: user_id }, { $push: { subscriptions: subscription_id } }).session(session);
  }

  //EMITTER PRODUCERS
  private async emitRemoveAllOffers(id: string, session: ClientSession) {
    return new Promise((resolve, reject) => {
      this.eventEmitter.emitAsync("offer.remove-all-by-owner-id", id, resolve, reject, session);
    });
  }

  //EMITTER LISTENERS
  @OnEvent("user.exists")
  async handleUserExistsEvent(
    userId: string,
    resolve: (result: boolean) => boolean,
    reject: (message: string) => string,
    session: ClientSession,
  ): Promise<void> {
    try {
      const res = await this.userExists(userId, session);
      resolve(res);
    } catch (error) {
      reject(UserErrors.GET_USER_EXISTS + error.message);
    }
  }

  @OnEvent("user.add-subscription")
  async handleAddSubscriptionEvent(
    userId: string,
    subscriptionId: string,
    resolve: () => void,
    reject: (message: string) => string,
    session: ClientSession,
  ): Promise<void> {
    try {
      await this.addSubscription(userId, subscriptionId, session);
      resolve();
    } catch (error) {
      reject(UserErrors.POST_ADD_SUBSCRIPTION + error.message);
    }
  }

  //UTILITY METHODS

  private async userExists(id: string, session?: ClientSession) {
    return !!(await this.userModel.exists({ _id: id }).session(session));
  }

  private async runUserSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(this.userModel, callback, customError);
  }
}
