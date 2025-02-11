import { BadRequestException, Injectable } from "@nestjs/common";

import BaseTierSchema from "../persistance/base-tier.schema";
import { BaseTierDto } from "../dto/tier.base.dto";

@Injectable()
export class TierServiceBase {
  addNewBaseTier = async (baseTier: BaseTierDto) => {
    try {
      const { name, settings } = baseTier;
      const newTier = new BaseTierSchema({
        name,
        settings,
      });
      await newTier.save();
    } catch (error: any) {
      throw new Error(`Ошибка при создании тира: ${error.message}`);
    }
  };

  getBaseTierById = async (id: string): Promise<BaseTierDto> => {
    try {
      const baseTier: BaseTierDto | null = await BaseTierSchema.findById(id);
      if (!baseTier) throw new Error("Тиры с таким ID: " + id + " не найдено");
      return {
        _id: baseTier._id,
        name: baseTier.name,
        settings: baseTier.settings,
      };
    } catch (error: any) {
      throw new Error(`Ошибка при получении тира: ${error.message}`);
    }
  };

  getAllBaseTiers = async (): Promise<BaseTierDto[]> => {
    try {
      const baseTiers: BaseTierDto[] = await BaseTierSchema.find();
      return baseTiers.map((baseTier) => ({
        _id: baseTier._id,
        name: baseTier.name,
        settings: baseTier.settings,
      }));
    } catch (error: any) {
      throw new Error(`Ошибка при получении списка тиров: ${error.message}`);
    }
  };

  deleteBaseTierById = async (id: string): Promise<BaseTierDto> => {
    try {
      const baseTier: BaseTierDto | null = await BaseTierSchema.findByIdAndDelete(id);
      if (!baseTier) throw new Error("Тира с таким ID: " + id + " не найдено");
      return {
        _id: baseTier._id,
        name: baseTier.name,
        settings: baseTier.settings,
      };
    } catch (error: any) {
      throw new Error(`Ошибка при удалении тирай: ${error.message}`);
    }
  };

  async updateBaseTierById(id: string, newBaseTier: BaseTierDto) {
    try {
      const { name, settings } = newBaseTier;

      const updatedTier = await BaseTierSchema.findByIdAndUpdate(id, { name, settings }, { new: true });
      if (!updatedTier) throw new BadRequestException(`Тира с таким ID: ${id} не найдено`);

      return updatedTier;
    } catch (error: any) {
      throw new Error(`Ошибка при обновлении тира: ${error.message}`);
    }
  }
}
