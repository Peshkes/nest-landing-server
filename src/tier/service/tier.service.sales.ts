import { BadRequestException, Injectable } from "@nestjs/common";
import { SalesTierDto } from "../dto/tier.sales.dto";
import { ClientSession, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SalesTierDocument } from "../persistance/sales-tier.schema";
import { SalesTier } from "../../share/share.types";

@Injectable()
export class TierServiceSales {
  constructor(@InjectModel(SalesTierDocument.name) private readonly salesTierModel: Model<SalesTierDocument>) {}

  addNewSalesTier = async (salesTier: SalesTierDto) => {
    try {
      const { name, duration, price, base_tier, sales_price, expiration_date } = salesTier;
      await new this.salesTierModel({
        name,
        duration,
        price,
        base_tier,
        sales_price: sales_price && sales_price,
        expiration_date: expiration_date ? expiration_date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).save();
    } catch (error: any) {
      throw new Error(`Ошибка при создании тира: ${error.message}`);
    }
  };

  getSalesTierById = async (id: string)=> {
    try {
      const salesTier: SalesTier | null = await this.salesTierModel.findById(id);
      if (!salesTier) throw new Error("Тиры с таким ID: " + id + " не найдено");
      return salesTier;
    } catch (error: any) {
      throw new Error(`Ошибка при получении тира: ${error.message}`);
    }
  };

  getSessionedSalesTierById = async (id: string, session: ClientSession): Promise<SalesTier> => {
    try {
      const salesTier = await this.salesTierModel.findById(id).session(session);
      if (!salesTier) throw new Error("Тиры с таким ID: " + id + " не найдено");
      return salesTier;
    } catch (error: any) {
      throw new Error(`Ошибка при получении тира: ${error.message}`);
    }
  };

  getAllSalesTiers = async (): Promise<SalesTier[]> => {
    try {
      return await this.salesTierModel.find();
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка тиров: ${error.message}`);
    }
  };

  deleteSalesTierById = async (id: string): Promise<SalesTier> => {
    try {
      const salesTier: SalesTier | null = await this.salesTierModel.findByIdAndDelete(id);
      if (!salesTier) throw new Error("Тира с таким ID: " + id + " не найдено");
      return salesTier;
    } catch (error: any) {
      throw new Error(`Ошибка при удалении тирай: ${error.message}`);
    }
  };

  async updateSalesTierById(id: string, newSalesTier: SalesTierDto) {
    try {
      const { name, duration, price, base_tier, sales_price, expiration_date } = newSalesTier;
      const updatedTier = await this.salesTierModel.findByIdAndUpdate(
        id,
        {
          name,
          duration,
          price,
          base_tier,
          sales_price,
          expiration_date,
        },
        { new: true },
      );
      if (!updatedTier) throw new BadRequestException("Тира с таким ID: " + id + " не найдено");
    } catch (error: any) {
      throw new Error(`Ошибка при обновлении тира: ${error.message}`);
    }
  }
}
