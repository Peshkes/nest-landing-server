import { BadRequestException, Injectable } from "@nestjs/common";
import DraftOfferModel from "../persistance/draftOfferModel";
import PublicOfferModel from "../persistance/publicOfferModel";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { PublicOfferDto } from "../dto/public-offer.dto";
import { ClientSession } from "mongoose";

@Injectable()
export class OfferService {
  async getOfferByOfferId(id: string): Promise<DraftOfferDto> {
    try {
      const offer: DraftOfferDto | null = await DraftOfferModel.findById(id);
      if (!offer) throw new BadRequestException("Коммерческого предложения с таким ID: " + id + " не найдено");
      return { name: offer.name, body: offer.body, _id: offer._id };
    } catch (error: any) {
      throw new Error(`Ошибка при получении коммерческого предложения: ${error.message}`);
    }
  }

  async getAllDraftOffers(): Promise<DraftOfferDto[]> {
    try {
      return await DraftOfferModel.find();
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка коммерческих предложений: ${error.message}`);
    }
  }

  async getOffersByUserId(id: string) {
    return Promise.resolve(undefined);
  }

  async getAllPublicOffers(): Promise<DraftOfferDto[]> {
    try {
      return await PublicOfferModel.find();
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка коммерческих предложений: ${error.message}`);
    }
  }

  async addNewOffer(offer: DraftOfferDto, session?: ClientSession) {
    try {
      const { name, body } = offer;
      const newOffer = new DraftOfferModel({
        name,
        body,
      });
      const savedOffer = await newOffer.save();
      return savedOffer._id;
    } catch (error: any) {
      throw new Error(`Ошибка при создании коммерческого предложения: ${error.message}`);
    }
  }

  async deletePublicOfferById(id: string): Promise<DraftOfferDto> {
    try {
      const offer: PublicOfferDto | null = await PublicOfferModel.findByIdAndDelete(id);
      if (!offer) throw new Error("Коммерческого предложения с таким ID: " + id + " не найдено");
      return offer;
    } catch (error: any) {
      throw new Error(`Ошибка при удалении коммерческих предложений: ${error.message}`);
    }
  }

  async deleteDraftOfferById(id: string, session?: ClientSession): Promise<DraftOfferDto> {
    try {
      const offer: DraftOfferDto | null = await DraftOfferModel.findByIdAndDelete(id).session(session); //Добавил сессию
      if (!offer) throw new Error("Коммерческого предложения с таким ID: " + id + " не найдено");
      return offer;
    } catch (error: any) {
      throw new Error(`Ошибка при удалении коммерческих предложений: ${error.message}`);
    }
  }

  async updateOfferById(newOffer: DraftOfferDto) {
    try {
      const { name, body, _id = null } = newOffer;
      if (!_id || !(await DraftOfferModel.findByIdAndUpdate(_id, { name, body }))) {
        return await this.addNewOffer(newOffer);
      }
    } catch (error: any) {
      throw new Error(`Ошибка при обновлении коммерчеого предложения: ${error.message}`);
    }
  }

  async publishOfferWithoutDraft(offerToPublish: DraftOfferDto, session: ClientSession): Promise<string> {
    try {
      const { name, body, _id = null } = offerToPublish;
      if (!_id || (await DraftOfferModel.findByIdAndDelete(_id))) {
        // return await this.saveOfferToPublicRepo(offerToPublish);
        return "";
      }
      if (_id && !(await PublicOfferModel.findByIdAndUpdate(_id, { name, body, update_date: new Date(Date.now()) })))
        throw new Error(`Ошибка при обновлении публикации предложения: некорректнвый ID ${_id}`);
    } catch (error: any) {
      throw new Error(`Ошибка при публикации коммерчеого предложения: ${error.message}`);
    }
  }

  async publishOfferFromDraft(offer_id: string, session: ClientSession): Promise<string> {
    return "";
  }

  async saveOfferToPublicRepo(offerToPublish: PublicOfferDto) {
    const { name, body, _id, expiration_date } = offerToPublish;
    const newPublicOffer = new PublicOfferModel({
      name,
      body,
      publication_date: new Date(Date.now()),
      expiration_date,
      _id,
    });
    const savedOffer = await newPublicOffer.save();
    return savedOffer._id;
  }

  async unpublishPublicOffer(offer_id: string, session: ClientSession): Promise<string> {
    return "";
  }

  async draftifyPublicOffer(offer_id: string, session: ClientSession): Promise<string> {
    return "";
  }

  async duplicateDraftOffer(offer_id: string, session: ClientSession): Promise<string> {
    return "";
  }

  async duplicateDraftOffers(offerIds: string[], session: ClientSession): Promise<string[]> {
    return [""];
  }

  async duplicatePublicOffers(offerIds: string[], session: ClientSession): Promise<string[]> {
    return [""];
  }

  async publicateOffer(offerToPublicate: PublicOfferDto) {
    return Promise.resolve(undefined);
  }

  async updateDraftOfferByUserId(newOffer: DraftOfferDto) {
    return Promise.resolve(undefined);
  }

  async getPublicOfferByOfferId(offer_id: string) {
    return Promise.resolve(undefined);
  }

  async updatePublicOfferByUserId(newOffer: DraftOfferDto) {
    return Promise.resolve(undefined);
  }

  async updatePublicOfferByGroupId(newOffer: DraftOfferDto) {
    return Promise.resolve(undefined);
  }

  async updateDraftOfferByGroupId(newOffer: DraftOfferDto) {
    return Promise.resolve(undefined);
  }
}
