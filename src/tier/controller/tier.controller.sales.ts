import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { SuperUserAccessGuard } from "../../security/guards/super-user-access.guard";
import { TierServiceSales } from "../service/tier.service.sales";
import { SalesTier } from "../../share/share.types";

@Controller("sales_tier")
export class TierControllerSales {
  constructor(private readonly tierSalesService: TierServiceSales) {}

  @Post("")
  @UseGuards(SuperUserAccessGuard)
  async addNewSalesTier(@Body() salesTier: SalesTier) {
    return await this.tierSalesService.addNewSalesTier(salesTier);
  }

  @Get("")
  @UseGuards(SuperUserAccessGuard)
  async getAllSalesTiers() {
    return await this.tierSalesService.getAllSalesTiers();
  }

  @Get("/:id")
  @UseGuards(SuperUserAccessGuard)
  async getSalesTierById(@Param("id") id: string) {
    return await this.tierSalesService.getSalesTierById(id);
  }

  @Delete("/:id")
  @UseGuards(SuperUserAccessGuard)
  async deleteSalesTierById(@Param("id") id: string) {
    return await this.tierSalesService.deleteSalesTierById(id);
  }

  @Put("/:id")
  @UseGuards(SuperUserAccessGuard)
  async updateSalesTierById(@Param("id") id: string, @Body() newSalesTier: SalesTier) {
    return await this.tierSalesService.updateSalesTierById(id, newSalesTier);
  }
}
