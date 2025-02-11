import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { SubscriptionService } from "../service/subscription.service";
import { SubscriptionDto } from "../../share/dto/subscription.dto";
import { PaymentDto } from "../dto/payment.dto";
import { RefundDto } from "../dto/refund.dto";
import { OwnerAccessGuard } from "../../share/guards/owner-access.guard";
import { SuperUserAccessGuard } from "../../share/guards/super-user-access.guard";
import { PaymentSystems } from "../subscription.types";

@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post("/:id/:tier_id")
  @UseGuards(OwnerAccessGuard)
  async createNewSubscription(@Param("id") id: string, @Param("tier_id") tier_id: string, @Body() payment_system: PaymentSystems) {
    await this.subscriptionService.createNewSubscription(id, tier_id, payment_system);
  }

  @Get("/:id")
  @UseGuards(OwnerAccessGuard)
  async getSubscriptionById(@Param("id") id: string): Promise<SubscriptionDto> {
    return this.subscriptionService.getSubscriptionById(id);
  }

  @Get("/expirationDate/:id")
  @UseGuards(OwnerAccessGuard)
  async getExpirationDateById(@Param("id") id: string): Promise<Date> {
    return this.subscriptionService.getExpirationDateById(id);
  }

  @Get("/cancel/:id")
  @UseGuards(OwnerAccessGuard)
  async cancelSubscription(@Param("subscription_id") subscription_id: string) {
    await this.subscriptionService.cancelSubscription(subscription_id);
  }

  @Delete("/:id")
  @UseGuards(SuperUserAccessGuard)
  async removeSubscriptionById(@Param("id") id: string) {
    await this.subscriptionService.removeSubscriptionById(id);
  }

  @Put("/paymentInfo")
  async receivePaymentInfo(@Body() payment: PaymentDto) {
    await this.subscriptionService.receivePaymentInfo(payment);
  }

  @Put("/refundInfo")
  async receiveRefundInfo(@Body() refundDto: RefundDto) {
    await this.subscriptionService.receiveRefundInfo(refundDto);
  }

  @Put("/prolongSubscription/:id/:subscription_id/:tier_id")
  @UseGuards(OwnerAccessGuard)
  async prolongOrPromoteSubscription(
    @Param("id") id: string,
    @Param("subscription_id") subscription_id: string,
    @Param("tier_id") tier_id: string,
    @Body() payment_system: PaymentSystems,
  ) {
    await this.subscriptionService.prolongOrPromoteSubscription(id, subscription_id, tier_id, payment_system);
  }

  @Put("/toggleSubscription/:id")
  @UseGuards(SuperUserAccessGuard)
  async toggleSubscription(@Param("id") id: string) {
    await this.subscriptionService.toggleSubscription(id);
  }
}
