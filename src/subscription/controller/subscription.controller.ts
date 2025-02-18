import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { SubscriptionService } from "../service/subscription.service";
import { PaymentDto } from "../dto/payment.dto";
import { RefundDto } from "../dto/refund.dto";
import { SuperUserAccessGuard } from "../../security/guards/super-user-access.guard";
import { Subscription } from "../subscription.types";
import { RequestWithUser } from "../../share/interfaces/request-with-user.interface";
import { AddSubscriptionDto } from "../../share/dto/add-subscription.dto";

@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get("/:subscription_id")
  async getSubscriptionById(@Param("subscription_id") id: string): Promise<Subscription> {
    return this.subscriptionService.getSubscriptionById(id);
  }

  @Get("/expiration/:subscription_id")
  async getExpirationDateById(@Param("subscription_id") id: string): Promise<Date> {
    return this.subscriptionService.getExpirationDateById(id);
  }

  @Post("")
  async createNewSubscription(@Req() request: RequestWithUser, @Body() addSubscriptionDto: AddSubscriptionDto) {
    await this.subscriptionService.createNewSubscription(request.user_id, addSubscriptionDto.tier_id, addSubscriptionDto.payment_system);
  }

  @Post("/payment")
  async receivePaymentInfo(@Body() payment: PaymentDto) {
    await this.subscriptionService.receivePaymentInfo(payment);
  }

  @Post("/refund")
  async receiveRefundInfo(@Body() refundDto: RefundDto) {
    await this.subscriptionService.receiveRefundInfo(refundDto);
  }

  @Delete("/:subscription_id")
  @UseGuards(SuperUserAccessGuard)
  async removeSubscriptionById(@Param("subscription_id") id: string) {
    await this.subscriptionService.removeSubscriptionById(id);
  }

  @Put("/cancel/:subscription_id")
  async cancelSubscription(@Param("subscription_id") subscription_id: string) {
    await this.subscriptionService.cancelSubscription(subscription_id);
  }

  @Put("/prolong/:subscription_id")
  async prolongOrPromoteSubscription(
    @Req() request: RequestWithUser,
    @Param("subscription_id") subscription_id: string,
    @Body() addSubscriptionDto: AddSubscriptionDto,
  ) {
    await this.subscriptionService.prolongOrPromoteSubscription(
      request.user_id,
      subscription_id,
      addSubscriptionDto.tier_id,
      addSubscriptionDto.payment_system,
    );
  }

  @Put("/toggle/:subscription_id")
  @UseGuards(SuperUserAccessGuard)
  async toggleSubscription(@Param("subscription_id") id: string) {
    await this.subscriptionService.toggleSubscription(id);
  }
}
