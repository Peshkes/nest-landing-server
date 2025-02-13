import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ClientSession, Model } from "mongoose";
import { MoveOffersRequestDto } from "../../share/dto/move-offers-request.dto";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { getAllPaginatedOffersQuery } from "../queries/get-all-paginated-offers.query";
import { runSession } from "../../share/functions/run-session";
import { UserException } from "../error/user-exception.class";
import { addOffersToUserQuery } from "../queries/add-offers-to-user.query";
import { ManageOfferFunctions } from "../../share/functions/manage-offer-functions";
import { OfferService } from "../../offer/service/offer.service";
import { OfferManagerService } from "../../share/interfaces/offer-manager";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { PaymentSystems } from "../../share/share.types";
import { UserDocument } from "../persistence/user.schema";
import { User } from "../authentication.types";

@Injectable()
export class UserService implements OfferManagerService {
  constructor(
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly offerService: OfferService,
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
      const user = await this.findUserById(id);
      return { email: user.email, name: user.name, _id: user._id };
    } catch (error: any) {
      throw UserException.GetUserException(error.message, error.statusCode);
    }
  }

  async getOffersByUserId(id: string, page: number, limit: number, roles: string[], statuses: string[]) {
    try {
      return getAllPaginatedOffersQuery(id, roles, statuses, page, limit);
    } catch (error: any) {
      throw UserException.GetOffersException(error.message, error.statusCode);
    }
  }

  async removeUser(id: string) {
    try {
      const account: User | null = await this.userModel.findByIdAndDelete(id);
      if (!account) throw new BadRequestException("Пользователь не найден");
      return { email: account.email, name: account.name, _id: account._id };
    } catch (error: any) {
      throw UserException.RemoveUserException(error.message, error.statusCode);
    }
  }

  async addSubscription(id: string, tier_id: string, payment_system: PaymentSystems) {
    return this.runUserSession(async (session) => {
      const exists = await this.userExists(id, session);
      if (!exists) throw new BadRequestException("Пользователя не существует");
      await this.userModel
        .updateOne(
          { id: id },
          {
            $push: {
              subscriptions: await this.emitAddSubscription(id, tier_id, payment_system, session),
            },
          },
        )
        .session(session);
    }, UserException.AddSubscriptionException);
  }

  //OFFER MANAGER METHODS
  async createDraftOffer(id: string, addOfferData: DraftOfferDto): Promise<string> {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.createDraftOffer(this.offerService, this.userModel, id, addOfferData, session);
    }, UserException.CreateDraftOfferException);
  }

  async publishOfferWithoutDraft(id: string, offer: DraftOfferDto) {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.publishOfferWithoutDraft(this.offerService, this.userModel, id, offer, session);
    }, UserException.PublishOfferException);
  }

  async publishDraftOffer(id: string, offer_id: string) {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.publishDraftOffer(this.offerService, this.userModel, id, offer_id, session);
    }, UserException.PublishDraftOfferException);
  }

  async unpublishPublicOffer(id: string, offer_id: string) {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.unpublishPublicOffer(this.offerService, this.userModel, id, offer_id, session);
    }, UserException.UnpublishOfferException);
  }

  async draftifyPublicOffer(id: string, offer_id: string) {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.draftifyPublicOffer(this.offerService, this.userModel, id, offer_id, session);
    }, UserException.DraftifyOfferException);
  }

  async duplicateDraftOffer(id: string, offer_id: string) {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.duplicateDraftOffer(this.offerService, this.userModel, id, offer_id, session);
    }, UserException.DuplicateDraftOfferException);
  }

  async removeOffer(id: string, offer_id: string) {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.removeOfferFromEntity(this.offerService, this.userModel, id, offer_id, session);
    }, UserException.RemoveOfferException);
  }

  async copyToGroup(id: string, group_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.copyOffersToAnotherEntity(
        this.offerService,
        this.userModel,
        id,
        group_id,
        moveOffersRequestDto,
        this.emitAddOffersToGroupEvent,
        session,
      );
    }, UserException.CopyToGroupException);
  }

  async moveToGroup(id: string, group_id: string, moveOffersRequestDto: MoveOffersRequestDto) {
    return this.runUserSession(async (session) => {
      return await ManageOfferFunctions.moveOffersToAnotherEntity(
        this.userModel,
        id,
        group_id,
        moveOffersRequestDto,
        this.emitAddOffersToGroupEvent,
        session,
      );
    }, UserException.MoveToGroupException);
  }

  async addOffersIds(user_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession): Promise<void> {
    await addOffersToUserQuery(user_id, moveOffersRequestDto, this.userModel, session);
  }

  //EMITTER PRODUCERS
  private async emitAddOffersToGroupEvent(
    group_id: string,
    moveOffersRequestDto: MoveOffersRequestDto,
    session: ClientSession,
  ): Promise<void> {
    return new Promise((resolve: () => void) => {
      this.eventEmitter.emitAsync("group.add-offers-ids", group_id, moveOffersRequestDto, resolve, session);
    });
  }

  private async emitAddSubscription(id: string, tier_id: string, payment_system: PaymentSystems, session: ClientSession): Promise<string> {
    return new Promise((resolve) => {
      this.eventEmitter.emitAsync(
        "subscription.add-subscription",
        id,
        tier_id,
        payment_system,
        (subscription: string) => resolve(subscription),
        session,
      );
    });
  }

  //EMITTER LISTENERS
  @OnEvent("user.exists")
  async handleUserExistsEvent(userId: string, callback: (result: boolean) => boolean, session: ClientSession): Promise<void> {
    callback(await this.userExists(userId, session));
  }

  @OnEvent("user.add-offers-ids")
  async handleAddOffersIds(user_id: string, moveOffersRequestDto: MoveOffersRequestDto, callback: () => void, session: ClientSession) {
    await this.addOffersIds(user_id, moveOffersRequestDto, session);
    callback();
  }

  //UTILITY METHODS
  private async findUserById(id: string, session?: ClientSession) {
    const user = await this.userModel.findById(id).session(session);
    if (!user) throw new BadRequestException("Пользователь не найден");
    return user;
  }

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
