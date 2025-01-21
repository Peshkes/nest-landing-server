import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { SubscriptionService } from "../service/subscription.service";
import { UserAccessGuard } from "../../share/guards/group-access.guard";
import { SubscriptionDto } from "../../share/dto/subscription.dto";
import { PaymentDto } from "../dto/payment.dto";

@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post("/:tier_id")
  @UseGuards(UserAccessGuard)
  async createNewSubscription(@Param("tier_id") tier_id: string): Promise<string> {
    return this.subscriptionService.createNewSubscription(tier_id);
  }

  @Get("/:id")
  @UseGuards(UserAccessGuard)
  async getSubscriptionById(@Param("id") id: string): Promise<SubscriptionDto> {
    return this.subscriptionService.getSubscriptionById(id);
  }

  @Get("/expirationDate/:id")
  @UseGuards(UserAccessGuard)
  async getExpirationDateById(@Param("id") id: string): Promise<string> {
    return this.subscriptionService.getExpirationDateById(id);
  }

  @Get("/pay/:id")
  @UseGuards(UserAccessGuard)
  async payForSubscription(@Param("id") id: string) {
    this.subscriptionService.payForSubscription(id);
  }

  @Get("/refund/:id")
  @UseGuards(UserAccessGuard)
  async refundSubscription(@Param("id") id: string) {
    this.subscriptionService.refundSubscription(id);
  }

  @Delete("/:id")
  @UseGuards(UserAccessGuard)
  async removeSubscriptionById(@Param("id") id: string): Promise<SubscriptionDto> {
    return this.subscriptionService.removeSubscriptionById(id);
  }

  @Put("/receivePaymentInfo")
  @UseGuards(UserAccessGuard)
  async receivePaymentInfo(@Body() payment: PaymentDto) {
    this.subscriptionService.receivePaymentInfo(payment);
  }

  @Put("/receiveRefundInfo")
  @UseGuards(UserAccessGuard)
  async receiveRefundInfo(@Body() refundDto: RefundDto) {
    this.subscriptionService.receiveRefundInfo(refundDto);
  }

  @Put("/prolongSubscription/:id")
  @UseGuards(UserAccessGuard)
  async prolongSubscription(@Param("id") id: string) {
    this.subscriptionService.prolongSubscription(id);
  }

  @Put("/promoteSubscription/:id/:tier_id")
  @UseGuards(UserAccessGuard)
  async promoteSubscription(@Param("id") id: string, @Param("tier_id") tier_id: string) {
    this.subscriptionService.promoteSubscription(id, tier_id);
  }

  @Put("/cancelSubscription/:id")
  @UseGuards(UserAccessGuard)
  async cancelSubscription(@Param("id") id: string) {
    this.subscriptionService.cancelSubscription(id);
  }

  @Put("/toggleSubscription/:id")
  @UseGuards(UserAccessGuard)
  async toggleSubscription(@Param("id") id: string) {
    this.subscriptionService.toggleSubscription(id);
  }
}
