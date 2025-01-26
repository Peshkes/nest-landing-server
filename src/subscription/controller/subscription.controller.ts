import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { SubscriptionService } from "../service/subscription.service";
import { UserAccessGuard } from "../../share/guards/group-access.guard";
import { SubscriptionDto } from "../../share/dto/subscription.dto";
import { PaymentDto } from "../dto/payment.dto";
import { RefundDto } from "../dto/refund.dto";

@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post("/:user_id/:tier_id")
  @UseGuards(UserAccessGuard)
  async createNewSubscription(@Param("user_id") user_id: string, @Param("tier_id") tier_id: string) {
    await this.subscriptionService.createNewSubscription(user_id, tier_id);
  }

  @Get("/:id")
  @UseGuards(UserAccessGuard)
  async getSubscriptionById(@Param("id") id: string): Promise<SubscriptionDto> {
    return this.subscriptionService.getSubscriptionById(id);
  }

  @Get("/expirationDate/:id")
  @UseGuards(UserAccessGuard)
  async getExpirationDateById(@Param("id") id: string): Promise<Date> {
    return this.subscriptionService.getExpirationDateById(id);
  }

  // @Get("/pay/:id")
  // @UseGuards(UserAccessGuard)
  // async payForSubscription(@Param("id") id: string) {
  //   this.subscriptionService.payForSubscription(id);
  // }

  @Get("/cancel/:id")
  @UseGuards(UserAccessGuard)
  async cancelSubscription(@Param("subscription_id") subscription_id: string) {
    await this.subscriptionService.cancelSubscription(subscription_id);
  }

  @Delete("/:id")
  @UseGuards(UserAccessGuard)
  async removeSubscriptionById(@Param("id") id: string) {
    await this.subscriptionService.removeSubscriptionById(id);
  }

  @Put("/paymentInfo")
  @UseGuards(UserAccessGuard)
  async receivePaymentInfo(@Body() payment: PaymentDto) {
    await this.subscriptionService.receivePaymentInfo(payment);
  }

  @Put("/refundInfo")
  @UseGuards(UserAccessGuard)
  async receiveRefundInfo(@Body() refundDto: RefundDto) {
    await this.subscriptionService.receiveRefundInfo(refundDto);
  }

  @Put("/prolongSubscription/:user_id/:subscription_id/:tier_id")
  @UseGuards(UserAccessGuard)
  async prolongOrPromoteSubscription(
    @Param("user_id") user_id: string,
    @Param("subscription_id") subscription_id: string,
    @Param("tier_id") tier_id: string,
  ) {
    await this.subscriptionService.prolongOrPromoteSubscription(user_id, subscription_id, tier_id);
  }

  @Put("/toggleSubscription/:id/:active")
  @UseGuards(UserAccessGuard)
  async toggleSubscription(@Param("id") id: string, @Param("active") active: boolean) {
    await this.subscriptionService.toggleSubscription(id, active);
  }
}
