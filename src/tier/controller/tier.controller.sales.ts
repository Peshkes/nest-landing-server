import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { SuperUserAccessGuard } from "../../share/guards/super-user-access.guard";
import { TierServiceSales } from "../service/tier.service.sales";
import { SalesTierDto } from "../dto/tier.sales.dto";

@Controller("sales_tier")
export class TierControllerBase {
  constructor(private readonly tierSalesService: TierServiceSales) {}

  @Post("")
  @UseGuards(SuperUserAccessGuard)
  async addNewSalesTier(@Body() salesTier: SalesTierDto) {
    return await this.tierSalesService.addNewSalesTier(salesTier);
  }
  // res.status(400).json({message: "Ошибка при создании тира: " + error.message});

  @Get("")
  @UseGuards(SuperUserAccessGuard)
  async getAllSalesTiers() {
    return await this.tierSalesService.getAllSalesTiers();
  }
  // res.status(400).json({message: error.message});

  @Get("/:id")
  @UseGuards(SuperUserAccessGuard)
  async getSalesTierById(@Param("id") id: string) {
    return await this.tierSalesService.getSalesTierById(id);
  }
  // res.status(400).json({message: error.message});

  @Delete("/:id")
  @UseGuards(SuperUserAccessGuard)
  async deleteSalesTierById(@Param("id") id: string) {
    return await this.tierSalesService.deleteSalesTierById(id);
  }
  // res.status(400).json({message: error.message});

  @Put("/:id")
  @UseGuards(SuperUserAccessGuard)
  async updateSalesTierById(@Param("id") id: string, @Body() newSalesTier: SalesTierDto) {
    return await this.tierSalesService.updateSalesTierById(id, newSalesTier);
  }
  // res.status(400).json({message: error.message});
}
