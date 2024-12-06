import { Injectable } from "@nestjs/common";
import DraftOfferModel from "../persistance/draftOfferModel";
import PublicOfferModel from "../persistance/publicOfferModel";
import { DraftOfferDto } from "../dto/draft-offer.dto";
import { PublicOfferDto } from "../dto/public-offer.dto";

@Injectable()
export class OfferService {
  async addNewOffer(offer: DraftOfferDto) {
    try {
      const { name, body } = offer;
      const newOffer = new DraftOfferModel({
        name,
        body,
      });
      await newOffer.save();
    } catch (error: any) {
      throw new Error(`Ошибка при создании коммерческого предложения: ${error.message}`);
    }
  }

  getOfferById = async (id: string): Promise<DraftOfferDto> => {
    try {
      const offer: DraftOfferDto | null = await DraftOfferModel.findById(id);
      // if (!offer) throw new Error("Коммерческого предложения с таким ID: " + id + " не найдено");
      if (!offer) throw new Error("Коммерческого предложения с таким ID: " + id + " не найдено");
      return { name: offer.name, body: offer.body, _id: offer._id };
    } catch (error: any) {
      throw new Error(`Ошибка при получении аккаунта: ${error.message}`);
    }
  };

  getAllDraftOffers = async (): Promise<DraftOfferDto[]> => {
    try {
      return await DraftOfferModel.find();
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка коммерческих предложений: ${error.message}`);
    }
  };

  getAllPublicOffers = async (): Promise<DraftOfferDto[]> => {
    try {
      return await PublicOfferModel.find();
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка коммерческих предложений: ${error.message}`);
    }
  };

  deletePublicOfferById = async (id: string): Promise<DraftOfferDto> => {
    try {
      const offer: PublicOfferDto | null = await PublicOfferModel.findByIdAndDelete(id);
      if (!offer) throw new Error("Коммерческого предложения с таким ID: " + id + " не найдено");
      return offer;
    } catch (error: any) {
      throw new Error(`Ошибка при удалении коммерческих предложений: ${error.message}`);
    }
  };

  deleteDraftOfferById = async (id: string): Promise<DraftOfferDto> => {
    try {
      const offer: DraftOfferDto | null = await DraftOfferModel.findByIdAndDelete(id);
      if (!offer) throw new Error("Коммерческого предложения с таким ID: " + id + " не найдено");
      return offer;
    } catch (error: any) {
      throw new Error(`Ошибка при удалении коммерческих предложений: ${error.message}`);
    }
  };

  updateOfferById = async (newOffer: DraftOfferDto) => {
    try {
      const { name, body, _id = null } = newOffer;
      if (!_id || !(await DraftOfferModel.findByIdAndUpdate(_id, { name, body }))) {
        return await this.addNewOffer(newOffer);
      }
    } catch (error: any) {
      throw new Error(`Ошибка при обновлении коммерчеого предложения: ${error.message}`);
    }
  };

  publicateOffer = async (offerToPublicate: PublicOfferDto) => {
    try {
      const { name, body, _id = null } = offerToPublicate;
      if (!_id || (await DraftOfferModel.findByIdAndDelete(_id))) {
        return await this.saveOfferToPublicRepo(offerToPublicate);
      }
      if (_id && !(await PublicOfferModel.findByIdAndUpdate(_id, { name, body, update_date: new Date(Date.now()) })))
        throw new Error(`Ошибка при обновлении публикации предложения: некорректнвый ID ${_id}`);
    } catch (error: any) {
      throw new Error(`Ошибка при публикации коммерчеого предложения: ${error.message}`);
    }
  };

  saveOfferToPublicRepo = async (offerToPublicate: PublicOfferDto) => {
    const { name, body, _id, expiration_date } = offerToPublicate;
    const newPublicOffer = new PublicOfferModel({
      name,
      body,
      publication_date: new Date(Date.now()),
      expiration_date,
      _id,
    });
    await newPublicOffer.save();
  };
}
