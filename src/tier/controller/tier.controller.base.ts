import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { TierServiceBase } from "../service/tier.service.base";
import { SuperUserAccessGuard } from "../../security/guards/super-user-access.guard";
import { BaseTierDto } from "../dto/tier.base.dto";

@Controller("base_tier")
export class TierControllerBase {
  constructor(private readonly tierBaseService: TierServiceBase) {}

  @Post("")
  @UseGuards(SuperUserAccessGuard)
  async addNewBaseTier(@Body() baseTier: BaseTierDto) {
    return await this.tierBaseService.addNewBaseTier({ name: baseTier.name, settings: baseTier.settings });
  }

  @Get("")
  @UseGuards(SuperUserAccessGuard)
  async getAllBaseTiers() {
    return await this.tierBaseService.getAllBaseTiers();
  }

  @Get("/:id")
  @UseGuards(SuperUserAccessGuard)
  async getBaseTierById(@Param("id") id: string) {
    return await this.tierBaseService.getBaseTierById(id);
  }

  @Delete("/:id")
  @UseGuards(SuperUserAccessGuard)
  async deleteBaseTierById(@Param("id") id: string) {
    return await this.tierBaseService.deleteBaseTierById(id);
  }

  @Put("/:id")
  @UseGuards(SuperUserAccessGuard)
  async updateBaseTierById(@Param("id") id: string, @Body() newBaseTier: BaseTierDto) {
    return await this.tierBaseService.updateBaseTierById(id, newBaseTier);
  }
}
