import { BadRequestException, Injectable } from "@nestjs/common";
import SalesTierModel from "../persistance/sales-tier.model";
import { SalesTierDto } from "../dto/tier.sales.dto";

@Injectable()
export class TierServiceSales {
  addNewSalesTier = async (salesTier: SalesTierDto) => {
    try {
      const { name, duration, price, base_tier, sales_price, expiration_date } = salesTier;
      const newTier = new SalesTierModel({
        name,
        duration,
        price,
        base_tier,
        sales_price: sales_price && sales_price,
        expiration_date: expiration_date ? expiration_date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await newTier.save();
    } catch (error: any) {
      throw new Error(`Ошибка при создании тира: ${error.message}`);
    }
  };

  getSalesTierById = async (id: string): Promise<SalesTierDto> => {
    try {
      const salesTier: SalesTierDto | null = await SalesTierModel.findById(id);
      if (!salesTier) throw new Error("Тиры с таким ID: " + id + " не найдено");
      return {
        _id: salesTier._id,
        name: salesTier.name,
        duration: salesTier.duration,
        price: salesTier.price,
        base_tier: salesTier.base_tier,
        sales_price: salesTier.sales_price,
        expiration_date: salesTier.expiration_date,
      };
    } catch (error: any) {
      throw new Error(`Ошибка при получении тира: ${error.message}`);
    }
  };

  getAllSalesTiers = async (): Promise<SalesTierDto[]> => {
    try {
      const salesTiers: SalesTierDto[] = await SalesTierModel.find();
      return salesTiers.map((salesTier) => ({
        _id: salesTier._id,
        name: salesTier.name,
        duration: salesTier.duration,
        price: salesTier.price,
        base_tier: salesTier.base_tier,
        sales_price: salesTier.sales_price,
        expiration_date: salesTier.expiration_date,
      }));
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка тиров: ${error.message}`);
    }
  };

  deleteSalesTierById = async (id: string): Promise<SalesTierDto> => {
    try {
      const salesTier: SalesTierDto | null = await SalesTierModel.findByIdAndDelete(id);
      if (!salesTier) throw new Error("Тира с таким ID: " + id + " не найдено");
      return {
        _id: salesTier._id,
        name: salesTier.name,
        duration: salesTier.duration,
        price: salesTier.price,
        base_tier: salesTier.base_tier,
        sales_price: salesTier.sales_price,
        expiration_date: salesTier.expiration_date,
      };
    } catch (error: any) {
      throw new Error(`Ошибка при удалении тирай: ${error.message}`);
    }
  };

  async updateSalesTierById(id: string, newSalesTier: SalesTierDto) {
    try {
      const { name, duration, price, base_tier, sales_price, expiration_date } = newSalesTier;
      const updatedTier = await SalesTierModel.findByIdAndUpdate(
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
