import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseTierDto } from "../dto/tier.base.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseTierDocument } from "../persistance/base-tier.schema";
import { BaseTier } from "../tier.types";

@Injectable()
export class TierServiceBase {
  constructor(@InjectModel(BaseTierDocument.name) private readonly baseTierModel: Model<BaseTierDocument>) {}

  addNewBaseTier = async (baseTier: BaseTierDto) => {
    try {
      const { name, settings } = baseTier;
      const newTier = new this.baseTierModel({
        name,
        settings,
      });
      await newTier.save();
    } catch (error: any) {
      throw new Error(`Ошибка при создании тира: ${error.message}`);
    }
  };

  getBaseTierById = async (id: string)=> {
    try {
      const baseTier: BaseTier | null = await this.baseTierModel.findById(id);
      if (!baseTier) throw new Error("Тиры с таким ID: " + id + " не найдено");
      return baseTier;
    } catch (error: any) {
      throw new Error(`Ошибка при получении тира: ${error.message}`);
    }
  };

  getAllBaseTiers = async (): Promise<BaseTier[]> => {
    try {
      return await this.baseTierModel.find();
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка тиров: ${error.message}`);
    }
  };

  deleteBaseTierById = async (id: string): Promise<BaseTier> => {
    try {
      const baseTier: BaseTier | null = await this.baseTierModel.findByIdAndDelete(id);
      if (!baseTier) throw new Error("Тира с таким ID: " + id + " не найдено");
      return baseTier;
    } catch (error: any) {
      throw new Error(`Ошибка при удалении тирай: ${error.message}`);
    }
  };

  async updateBaseTierById(id: string, newBaseTier: BaseTierDto): Promise<BaseTier> {
    try {
      const { name, settings } = newBaseTier;
      const updatedTier = await this.baseTierModel.findByIdAndUpdate(id, { name, settings }, { new: true });
      if (!updatedTier) throw new BadRequestException(`Тира с таким ID: ${id} не найдено`);
      return updatedTier;
    } catch (error: any) {
      throw new Error(`Ошибка при обновлении тира: ${error.message}`);
    }
  }
}
