import { BadRequestException } from "@nestjs/common";
import { OfferService } from "../../offer/service/offer.service";
import { DraftOfferDto } from "../dto/draft-offer.dto";
import { ClientSession, Model } from "mongoose";
import { OfferManager, OfferManagerService } from "../interfaces/offer-manager";
import { MoveOffersRequestDto } from "../dto/move-offers-request.dto";

export class ManageOfferFunctions {
  static async createDraftOffer<T extends OfferManager>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    addOfferData: DraftOfferDto,
    session: ClientSession,
  ): Promise<string> {
    const draftOfferId = await offerService.addNewOffer(addOfferData, session);
    const result = await model.updateOne({ _id: id }, { $push: { draft_offers: draftOfferId } }, { session });
    if (result.modifiedCount === 0) throw new BadRequestException(`Сущность с ID ${id} не найдена или не обновлена`);
    return draftOfferId;
  }

  static async publishOfferWithoutDraft<T extends OfferManager>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    offer: DraftOfferDto,
    session: ClientSession,
  ): Promise<string> {
    const entity = await model.findById(id).session(session);
    if (!entity) throw new BadRequestException(`Сущность с ID ${id} не найдена`);

    const publicOfferId = await offerService.publishOfferWithoutDraft(offer, session);
    entity.public_offers.push(publicOfferId);

    await entity.save({ session });
    return publicOfferId;
  }

  static async publishDraftOffer<T extends OfferManager>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    offer_id: string,
    session: ClientSession,
  ): Promise<string> {
    const result = await model.findByIdAndUpdate(
      id,
      {
        $push: { public_offers: offer_id },
        $pull: { draft_offers: offer_id },
      },
      { new: true, session },
    );

    if (!result) throw new BadRequestException(`Сущность с ID ${id} не найдена`);
    return await offerService.publishOfferFromDraft(offer_id, session);
  }

  static async copyOffersToAnotherEntity<T extends OfferManager>(
    offerService: OfferService,
    from_model: Model<T>,
    from_id: string,
    to_id: string,
    moveOffersRequestDto: MoveOffersRequestDto,
    emitFunction: (group_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession) => Promise<void>,
    session: ClientSession,
  ) {
    const entity = await from_model.findById(from_id, { session });
    if (!entity) throw new Error(`Entity with ID ${from_id} not found`);

    const newPublicOfferIds: string[] = [];
    const newDraftOfferIds: string[] = [];

    if (moveOffersRequestDto.publicOffersToMove?.length) {
      const publicOffersToCopy = moveOffersRequestDto.publicOffersToMove.filter((offerId) => entity.public_offers.includes(offerId));
      const newOfferIds = await offerService.duplicatePublicOffers(publicOffersToCopy, session);
      newPublicOfferIds.push(...newOfferIds);
    }

    if (moveOffersRequestDto.draftOffersToMove?.length) {
      const draftOffersToCopy = moveOffersRequestDto.draftOffersToMove.filter((offerId) => entity.draft_offers.includes(offerId));
      const newOfferIds = await offerService.duplicateDraftOffers(draftOffersToCopy, session);
      newDraftOfferIds.push(...newOfferIds);
    }

    const updateToEntity = {};
    if (newPublicOfferIds.length) {
      updateToEntity["$push"] = updateToEntity["$push"] || {};
      updateToEntity["$push"]["public_offers"] = { $each: newPublicOfferIds };
    }

    if (newDraftOfferIds.length) {
      updateToEntity["$push"] = updateToEntity["$push"] || {};
      updateToEntity["$push"]["draft_offers"] = { $each: newDraftOfferIds };
    }

    await emitFunction(to_id, updateToEntity, session);
    return { newPublicOfferIds, newDraftOfferIds };
  }

  static async moveOffersToAnotherEntity<F extends OfferManager, T extends OfferManager>(
    from_model: Model<F>,
    from_id: string,
    to_id: string,
    moveOffersRequestDto: MoveOffersRequestDto,
    emitFunction: (group_id: string, moveOffersRequestDto: MoveOffersRequestDto, session: ClientSession) => Promise<void>,
    session: ClientSession,
  ) {
    const fromEntity = await from_model.findById(from_id, null, { session });
    if (!fromEntity) throw new BadRequestException(`Entity with ID ${from_id} not found in ${from_model.modelName}`);

    const { publicOffersToMove, draftOffersToMove } = moveOffersRequestDto;

    if (publicOffersToMove?.length || draftOffersToMove?.length) {
      const updateFromEntity = {};

      if (publicOffersToMove?.length) {
        updateFromEntity["$pull"] = updateFromEntity["$pull"] || {};
        updateFromEntity["$pull"]["public_offers"] = { $in: publicOffersToMove };
      }
      if (draftOffersToMove?.length) {
        updateFromEntity["$pull"] = updateFromEntity["$pull"] || {};
        updateFromEntity["$pull"]["draft_offers"] = { $in: draftOffersToMove };
      }

      const updateToEntity = {};
      if (publicOffersToMove?.length) {
        updateToEntity["$push"] = updateToEntity["$push"] || {};
        updateToEntity["$push"]["public_offers"] = { $each: publicOffersToMove };
      }
      if (draftOffersToMove?.length) {
        updateToEntity["$push"] = updateToEntity["$push"] || {};
        updateToEntity["$push"]["draft_offers"] = { $each: draftOffersToMove };
      }

      from_model.updateOne({ _id: from_id }, updateFromEntity, { session });
      await emitFunction(to_id, updateToEntity, session);
    }
  }

  static async unpublishPublicOffer<T extends OfferManager>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    offer_id: string,
    session: ClientSession,
  ): Promise<string> {
    const draftOfferId = await offerService.unpublishPublicOffer(offer_id, session);
    const updateResult = await model.findByIdAndUpdate(
      id,
      {
        $push: { draft_offers: draftOfferId },
        $pull: { public_offers: offer_id },
      },
      { new: true, session },
    );

    if (!updateResult) throw new BadRequestException(`Сущность с ID ${id} не найдена`);
    return draftOfferId;
  }

  static async draftifyPublicOffer<T extends OfferManager>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    offer_id: string,
    session: ClientSession,
  ): Promise<string> {
    const draftOfferId = await offerService.draftifyPublicOffer(offer_id, session);
    const updateResult = await model.findByIdAndUpdate(
      id,
      {
        $push: { draft_offers: draftOfferId },
      },
      { new: true, session },
    );
    if (!updateResult) throw new BadRequestException(`Сущность с ID ${id} не найдена`);
    return draftOfferId;
  }

  static async duplicateDraftOffer<T extends OfferManager>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    offer_id: string,
    session: ClientSession,
  ): Promise<string> {
    const draftOfferId = await offerService.duplicateDraftOffer(offer_id, session);
    const updateResult = await model.findByIdAndUpdate(
      id,
      { $push: { draft_offers: draftOfferId } },
      {
        new: true,
        session,
      },
    );

    if (!updateResult) throw new BadRequestException(`Сущность с ID ${id} не найдена`);
    return draftOfferId;
  }

  static async removeOfferFromEntity<T extends OfferManager>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    offer_id: string,
    session: ClientSession,
  ): Promise<DraftOfferDto> {
    const draftOffer = await offerService.deleteDraftOfferById(offer_id, session);
    const updateResult = await model.findByIdAndUpdate(
      id,
      { $pull: { public_offers: offer_id } },
      {
        new: true,
        session,
      },
    );

    if (!updateResult) throw new BadRequestException(`Сущность с ID ${id} не найдена`);
    return draftOffer;
  }
}
