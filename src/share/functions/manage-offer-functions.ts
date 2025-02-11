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

  static async copyOffersToAnotherEntity<T extends OfferManager, S extends OfferManagerService>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    to_id: string,
    to_service: S,
    moveOffersRequestDto: MoveOffersRequestDto,
    session: ClientSession,
  ) {
    const entity = await model.findById(id, { session });
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

    await to_service.addOffersIds(to_id, { publicOffersToMove: newPublicOfferIds, draftOffersToMove: newDraftOfferIds }, session);

    return { newPublicOfferIds, newDraftOfferIds };
  }

  static async moveOffersToAnotherEntity<T extends OfferManager, S extends OfferManagerService>(
    offerService: OfferService,
    model: Model<T>,
    id: string,
    to_id: string,
    to_service: S,
    moveOffersRequestDto: MoveOffersRequestDto,
    session: ClientSession,
  ) {
    const entity = await model.findById(id, session);
    const publicOffersToMove: string[] = [];
    const draftOffersToMove: string[] = [];

    entity.public_offers = entity.public_offers.filter((offerId) => {
      if (moveOffersRequestDto.publicOffersToMove?.includes(offerId)) {
        publicOffersToMove.push(offerId);
        return false;
      }
      return true;
    });

    entity.draft_offers = entity.draft_offers.filter((offerId) => {
      if (moveOffersRequestDto.draftOffersToMove?.includes(offerId)) {
        draftOffersToMove.push(offerId);
        return false;
      }
      return true;
    });

    await to_service.addOffersIds(to_id, { publicOffersToMove, draftOffersToMove }, session);

    await entity.save({ session });
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
