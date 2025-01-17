import { Injectable } from "@nestjs/common";
import DraftOfferModel from "../persistance/draftOfferModel";
import PublicOfferModel from "../persistance/publicOfferModel";
import { DraftOfferDto } from "../../share/dto/draft-offer.dto";
import { PublicOfferDto } from "../dto/public-offer.dto";
import { ClientSession } from "mongoose";

@Injectable()
export class OfferService {
  async addNewOffer(offer: DraftOfferDto, session: ClientSession) {
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

  async getOfferById(id: string): Promise<DraftOfferDto> {
    try {
      const offer: DraftOfferDto | null = await DraftOfferModel.findById(id);
      // if (!offer) throw new Error("Коммерческого предложения с таким ID: " + id + " не найдено");
      if (!offer) throw new Error("Коммерческого предложения с таким ID: " + id + " не найдено");
      return { name: offer.name, body: offer.body, _id: offer._id };
    } catch (error: any) {
      throw new Error(`Ошибка при получении аккаунта: ${error.message}`);
    }
  }

  async getAllDraftOffers(): Promise<DraftOfferDto[]> {
    try {
      return await DraftOfferModel.find();
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка коммерческих предложений: ${error.message}`);
    }
  }

  async getAllPublicOffers(): Promise<DraftOfferDto[]> {
    try {
      return await PublicOfferModel.find();
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка коммерческих предложений: ${error.message}`);
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

  async deleteDraftOfferById(id: string, session: ClientSession): Promise<DraftOfferDto> {
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

  async publishOfferWithoutDraft(offerToPublish: DraftOfferDto, session: ClientSession) {
    try {
      const { name, body, _id = null } = offerToPublish;
      if (!_id || (await DraftOfferModel.findByIdAndDelete(_id))) {
        return await this.saveOfferToPublicRepo(offerToPublish);
      }
      if (_id && !(await PublicOfferModel.findByIdAndUpdate(_id, { name, body, update_date: new Date(Date.now()) })))
        throw new Error(`Ошибка при обновлении публикации предложения: некорректнвый ID ${_id}`);
    } catch (error: any) {
      throw new Error(`Ошибка при публикации коммерчеого предложения: ${error.message}`);
    }
  }

  async publishOfferFromDraft(offer_id: string, session: ClientSession): Promise<string> {}

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

  async unpublishPublicOffer(offer_id: string, session: ClientSession): Promise<string> {}

  async draftifyPublicOffer(offer_id: string, session: ClientSession): Promise<string> {}

  async duplicateDraftOffer(offer_id: string, session: ClientSession): Promise<string> {}

  async duplicateDraftOffers(offerIds: string[], session: ClientSession): Promise<string[]> {}

  async duplicatePublicOffers(offerIds: string[], session: ClientSession): Promise<string[]> {}
}
