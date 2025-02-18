import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { PublicOfferDto } from "../dto/public-offer.dto";
import { ClientSession, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { OfferException } from "../errors/offer-exception.classes";
import { OfferErrors } from "../errors/offer-errors.class";
import { AbstractOffer, DraftOffer, OfferRole, OfferStatus, OwnerType, PublicOffer, SortType } from "../offer.types";
import { DraftOfferDocument, DraftOfferSchema, OfferDocument, PublicOfferDocument, PublicOfferSchema } from "../persistance/offer.schema";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { runSession } from "../../share/functions/run-session";
import { ArchiveOfferDocument } from "../persistance/archive-offer.schema";

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(OfferDocument.name) private readonly offerModel: Model<OfferDocument>,
    private readonly eventEmitter: EventEmitter2,
    @InjectModel(ArchiveOfferDocument.name) private readonly archiveOfferModel: Model<ArchiveOfferDocument>,
  ) {}

  draftModel = this.offerModel.discriminator<DraftOfferDocument>("draft", DraftOfferSchema);
  publicModel = this.offerModel.discriminator<PublicOfferDocument>("published", PublicOfferSchema);

  //SUPER USER
  async getAllOffers(pageNumber: number, pageSize: number): Promise<(DraftOfferDto | PublicOfferDto)[]> {
    const offset = pageNumber * pageSize;
    try {
      const offers: (DraftOfferDto | PublicOfferDto)[] = await this.offerModel.find().sort(SortType.min).skip(offset).limit(pageSize);
      if (!offers || offers.length === 0) throw new BadRequestException(OfferErrors.NO_OFFERS_FOUND);
      return offers;
    } catch (error: any) {
      throw OfferException.AllOffersReceivingException(error.message, error.statusCode);
    }
  }

  //Normal USER
  async getAllOffersByGroup(
    pageNumber: number,
    pageSize: number,
    group_id: string,
    sort?: SortType,
  ): Promise<(DraftOfferDto | PublicOfferDto)[]> {
    const offset = pageNumber * pageSize;
    try {
      const offers: (DraftOfferDto | PublicOfferDto)[] = await this.offerModel
        .find({ owner_id: group_id })
        .sort(sort ? sort : SortType.min)
        .skip(offset)
        .limit(pageSize);
      if (!offers || offers.length === 0) throw new BadRequestException(OfferErrors.NO_OFFERS_FOUND);
      return offers;
    } catch (error: any) {
      throw OfferException.AllOffersByGroupReceivingException(error.message, error.statusCode);
    }
  }

  async getAllArchiveOffers(
    user_id: string,
    pageNumber: number,
    pageSize: number,
    search?: string,
    sort?: SortType,
    offerRoles?: OfferRole[],
  ) {
    return this.runOfferSession(async (session) => {
      const offset = pageNumber * pageSize;
      const ownerIds = await this.getOwnerIds(offerRoles, user_id, session);
      const filter: any = { owner_id: { $in: ownerIds } };
      if (search) filter.name = { $regex: search, $options: "i" };
      const offers: (DraftOfferDto | PublicOfferDto)[] = await this.archiveOfferModel
        .find()
        .sort(sort ? sort : SortType.min)
        .skip(offset)
        .limit(pageSize);
      if (!offers || offers.length === 0) throw new BadRequestException(OfferErrors.NO_OFFERS_FOUND);
      return offers;
    }, OfferException.AllArchiveOffersReceivingException);
  }

  async getAllOffersOfUser(
    user_id: string,
    pageNumber: number,
    pageSize: number,
    statuses?: OfferStatus[],
    offerRoles?: OfferRole[],
    search?: string,
    sort?: SortType,
  ): Promise<(DraftOffer | PublicOffer)[]> {
    return this.runOfferSession(async (session) => {
      const offset = pageNumber * pageSize;

      const ownerIds = await this.getOwnerIds(offerRoles, user_id, session);
      const filter: any = { owner_id: { $in: ownerIds } };

      const model = this.chooseModel(statuses, filter);

      if (search) filter.name = { $regex: search, $options: "i" };

      const offers: (DraftOffer | PublicOffer)[] = await model
        .find(filter)
        .sort(sort ? sort : SortType.min)
        .skip(offset)
        .limit(pageSize);
      if (!offers || offers.length === 0) throw new BadRequestException(OfferErrors.NO_OFFERS_FOUND);
      return offers;
    }, OfferException.AllOffersReceivingException);
  }

  private chooseModel(statuses: OfferStatus[], filter: any) {
    let model: Model<OfferDocument | DraftOfferDocument | PublicOfferDocument>;
    if (statuses && statuses.length > 0) {
      if (statuses.length === 1) {
        const statusModelMap = {
          [OfferStatus.draft]: this.draftModel,
          [OfferStatus.published]: this.publicModel,
        };
        model = statusModelMap[statuses[0]] || this.offerModel;
      } else {
        model = this.offerModel;
        filter.status = { $in: statuses };
      }
    }
    return model;
  }

  private async getOwnerIds(offerRoles: OfferRole[], user_id: string, session: ClientSession) {
    let ownerIds: string[] = [];
    if (offerRoles && offerRoles.length > 0) {
      if (!(offerRoles.length === 1 && offerRoles[0] === "owner"))
        ownerIds = await this.emitGetOwnerIds(
          user_id,
          session,
          offerRoles.filter((role) => role !== "owner"),
        );
    } else {
      ownerIds = await this.emitGetOwnerIds(user_id, session);
    }
    ownerIds.push(user_id);
    return ownerIds;
  }

  async getDraftOfferByOfferId(id: string): Promise<DraftOffer> {
    try {
      const offer: DraftOffer = await this.draftModel.findById(id);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return offer;
    } catch (error: any) {
      throw OfferException.DraftOfferReceivingException(error.message, error.statusCode);
    }
  }

  async getArchivedOfferByOfferId(id: string): Promise<AbstractOffer> {
    try {
      const offer: AbstractOffer = await this.archiveOfferModel.findById(id);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return offer;
    } catch (error: any) {
      throw OfferException.OfferReceivingFromArchiveException(error.message, error.statusCode);
    }
  }

  async getPublicOfferByOfferId(id: string): Promise<PublicOffer> {
    try {
      const offer: PublicOffer = await this.publicModel.findById(id);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return offer;
    } catch (error: any) {
      throw OfferException.PublicOfferReceivingException(error.message, error.statusCode);
    }
  }

  async addNewOffer(offer: DraftOfferDto) {
    return this.runOfferSession(async (session) => {
      const newOffer = new this.offerModel(offer).save({ session });
      const savedOffer = await newOffer;
      return savedOffer._id;
    }, OfferException.CreateNewOfferException);
  }

  async archiveOfferById(_id: string) {
    return this.runOfferSession(async (session) => {
      const offer = await this.offerModel.findByIdAndDelete(_id).session(session);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      const newOffer = new this.archiveOfferModel(offer);
      const savedOffer = await newOffer.save({ session });
      return savedOffer._id;
    }, OfferException.CreateArchiveOfferException);
  }

  async copyManyOffersFromArchiveByIdsAndDelete(offerIds: string[]): Promise<string[]> {
    return this.runOfferSession(async (session) => {
      const newOffersIds = await this.copyFromArchive(offerIds, session);
      await this.archiveOfferModel.deleteMany({ _id: { $in: offerIds } }).session(session);
      return newOffersIds;
    }, OfferException.CreateArchiveOfferException);
  }

  async copyManyOffersFromArchiveByIds(offerIds: string[]): Promise<string[]> {
    return this.runOfferSession(async (session) => {
      return await this.copyFromArchive(offerIds, session);
    }, OfferException.CreateArchiveOfferException);
  }

  private async copyFromArchive(offerIds: string[], session: ClientSession) {
    const offers = await this.archiveOfferModel.find({ _id: { $in: offerIds } }).session(session);
    if (!offers || offers.length === 0) throw new BadRequestException(OfferErrors.NO_OFFERS_FOUND);
    const newOffers: DraftOffer[] = [];
    const newOffersIds: string[] = [];
    offers.forEach((offer) => {
      const newDraft = new this.draftModel(offer);
      newOffers.push(newDraft);
      newOffersIds.push(newDraft.id);
    });
    await this.draftModel.insertMany(newOffers, { session });
    return newOffersIds;
  }

  async copyOffersFromArchiveByIdAnsDelete(_id: string): Promise<string[]> {
    return this.runOfferSession(async (session) => {
      const offer = await this.offerModel.findByIdAndDelete(_id).session(session);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      const newOffer = new this.draftModel(offer);
      const savedOffer = await newOffer.save({ session });
      return savedOffer._id;
    }, OfferException.CreateArchiveOfferException);
  }

  async deleteOfferById(id: string): Promise<DraftOfferDto> {
    return this.runOfferSession(async (session) => {
      const offer = await this.offerModel.findByIdAndDelete(id).session(session);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return offer;
    }, OfferException.OfferDeletingException);
  }

  async deleteManyOffersById(offerIds: string[]) {
    return this.runOfferSession(async (session) => {
      await this.offerModel.deleteMany({ _id: { $in: offerIds } }).session(session);
    }, OfferException.OfferDeletingException);
  }

  async deleteOfferFromArchiveById(id: string): Promise<AbstractOffer> {
    return this.runOfferSession(async (session) => {
      const offer = await this.archiveOfferModel.findByIdAndDelete(id).session(session);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return offer;
    }, OfferException.ArchiveOfferDeletingException);
  }

  async deleteManyOffersFromArchiveById(offerIds: string[]) {
    return this.runOfferSession(async (session) => {
      await this.archiveOfferModel.deleteMany({ _id: { $in: offerIds } }).session(session);
    }, OfferException.ArchiveOfferDeletingException);
  }

  private async deleteAllOffersByOwnerId(owner_id: string, session: ClientSession) {
    await this.offerModel.deleteMany({ owner_id }).session(session);
  }

  async updateDraftByOfferId(offer_id: string, newOffer: DraftOfferDto | PublicOfferDto) {
    try {
      const { name, body } = newOffer;
      if (!(await this.offerModel.findByIdAndUpdate({ offer_id }, { name, body }))) {
        throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      }
    } catch (error: any) {
      throw OfferException.UpdateOfferException(error.message, error.statusCode);
    }
  }

  async publishOfferWithoutDraft(
    offerToPublish: PublicOfferDto,
    owner_type: OwnerType,
    ownerId: string,
    session?: ClientSession,
  ): Promise<string> {
    return await this.saveNewPublicOffer(offerToPublish, owner_type, ownerId, session);
  }

  async publishOfferFromDraft(
    _id: string,
    owner_type: OwnerType,
    ownerId: string,
    duration: number,
    session?: ClientSession,
  ): Promise<string> {
    const offer: PublicOfferDto = {
      ...(await this.offerModel.findByIdAndDelete(_id).session(session)),
      duration,
    };
    if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
    return await this.saveNewPublicOffer(offer, owner_type, ownerId, session);
  }

  async unpublishPublicOffer(_id: string): Promise<string> {
    return this.runOfferSession(async (session) => {
      const publishedOffer: PublicOffer = await this.publicModel.findByIdAndDelete(_id).session(session);
      if (!publishedOffer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return await this.saveNewDraftOffer(publishedOffer, session);
    }, OfferException.UnpublishException);
  }

  async copyPublishedToDrafts(_id: string): Promise<string> {
    return this.runOfferSession(async (session) => {
      const publishedOffer: PublicOffer = await this.publicModel.findById(_id).session(session);
      if (!publishedOffer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return await this.saveNewDraftOffer(publishedOffer, session);
    }, OfferException.CopyPublishedToDraftsException);
  }

  async duplicateDraftOffer(_id: string): Promise<string> {
    return this.runOfferSession(async (session) => {
      const draft: DraftOffer = await this.draftModel.findById(_id).session(session);
      if (!draft) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return await this.saveNewDraftOffer(draft, session);
    }, OfferException.DuplicateDraftOffersException);
  }

  async moveOffer(_id: string, entityId: string, newType: OwnerType): Promise<string> {
    return this.runOfferSession(async (session) => {
      const offer = await this.offerModel
        .findByIdAndUpdate(
          { _id },
          {
            owner_type: newType,
            owner_id: entityId,
          },
        )
        .session(session);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      return offer._id;
    }, OfferException.MoveOffersException);
  }

  async copyOfferBetweenGroupAndUser(_id: string, entityId: string, newType: OwnerType): Promise<string> {
    return this.runOfferSession(async (session) => {
      const offer: DraftOffer = await this.draftModel.findById(_id).session(session);
      if (!offer) throw new BadRequestException(OfferErrors.OFFER_NOT_FOUND);
      offer.owner_type = newType;
      offer.owner_id = entityId;
      return await this.saveNewDraftOffer(offer, session);
    }, OfferException.CopyOfferBetweenGroupAndUserException);
  }

  async duplicateOffers(offerIds: string[]): Promise<string[]> {
    return this.runOfferSession(async (session) => {
      const offers = await this.offerModel.find({ _id: { $in: offerIds } }).session(session);
      if (!offers || offers.length === 0) throw new BadRequestException(OfferErrors.OFFERS_NOT_FOUND);
      if (offers.length < offerIds.length) throw new BadRequestException(OfferErrors.SOME_OFFERS_NOT_FOUND);
      const newOffers: DraftOffer[] = [];
      const newOffersIds: string[] = [];
      offers.forEach((draft) => {
        const newDraft = new this.draftModel(draft);
        newOffers.push(newDraft);
        newOffersIds.push(newDraft.id);
      });
      await this.draftModel.insertMany(newOffers, { session });
      return newOffersIds;
    }, OfferException.DuplicateDraftOffersException);
  }

  //Utils
  private async saveNewPublicOffer(
    offer: PublicOfferDto,
    owner_type: OwnerType,
    owner_id: string,
    session: ClientSession,
    draft_id?: string,
  ): Promise<string> {
    const { name, body, duration } = offer;
    const newOffer = new this.offerModel({
      name,
      body,
      status: OfferStatus.published,
      owner_type,
      owner_id,
      publication_date: new Date(Date.now()),
      expiration_date: new Date(Date.now() + duration),
    });
    if (draft_id) newOffer[draft_id] = draft_id;
    try {
      const savedOffer = await newOffer.save({ session });
      return savedOffer._id;
    } catch (error: any) {
      throw OfferException.SavePublicOfferException(error.message, error.statusCode);
    }
  }

  private async saveNewDraftOffer(copiedOffer: DraftOffer | PublicOffer, session: ClientSession): Promise<string> {
    const newOffer = new this.offerModel({
      name: copiedOffer.name,
      body: copiedOffer.body,
      status: OfferStatus.published,
      owner_type: copiedOffer.owner_type,
      owner_id: copiedOffer.owner_id,
    });
    try {
      await newOffer.save({ session });
      return newOffer._id;
    } catch (error: any) {
      throw OfferException.SaveDraftOfferException(error.message, error.statusCode);
    }
  }

  private async runOfferSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(this.offerModel, callback, customError);
  }

  //Listeners
  @OnEvent("offer.remove-all-by-owner-id")
  async handleRemoveAllByOwnerId(owner_id: string, resolve: () => void, reject: (message: string) => string, session: ClientSession) {
    try {
      await this.deleteAllOffersByOwnerId(owner_id, session);
      resolve();
    } catch (error: any) {
      reject(OfferErrors.DELETE_ALL_OFFERS_BY_OWNER_ID_ERROR + error.message);
    }
  }

  //Producers
  private async emitGetOwnerIds(userId: string, session: ClientSession, offerRoles: string[] = []): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.eventEmitter.emitAsync("group.get-ids-by-userid", userId, resolve, reject, offerRoles, session);
    });
  }
}
