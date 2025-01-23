import { HttpStatus, Injectable } from "@nestjs/common";
import SubscriptionModel from "../persistanse/subscription.model";
import { SubscriptionDto } from "../../share/dto/subscription.dto";
import { v4 as uuidv4 } from "uuid";
import { PaymentDto } from "../dto/payment.dto";
import SalesTierModel from "../../tier/persistance/sales-tier.model";
import { SubscriptionException } from "../errors/subscription-exception.classes";
import { MailService } from "../../share/services/mailing.service";
import { RedisService } from "../../redis/service/redis.service";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import UserModel from "../../authentication/persistence/user.model";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) {}

  async createNewSubscription(user_id: string, tier_id: string) {
    const tier = await SalesTierModel.findById(tier_id);
    if (!tier || tier.expiration_date < new Date(Date.now())) throw SubscriptionException.SubscriptionExpiredException();
    const key = uuidv4();
    const token = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    try {
      await this.redisService.setValue(
        token,
        JSON.stringify({
          user_id,
          tier_id,
          key,
          duration: tier.duration,
        }),
        86400 * 7,
      );
      this.initPayment(token);
    } catch (error: any) {
      throw SubscriptionException.CreateNewSubscriptionException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private initPayment(token: string) {}

  async receivePaymentInfo(payment: PaymentDto) {
    try {
      const token = payment.token;
      const subscription = JSON.parse(await this.redisService.getValue(token));
      if (!subscription)
        throw SubscriptionException.InvalidTokenException(token, HttpStatus.BAD_GATEWAY || HttpStatus.INTERNAL_SERVER_ERROR);
      subscription.is_active = true;
      subscription.start_date = new Date(Date.now());
      subscription.expiration_date = new Date(Date.now() + payment.duration);
      subscription.payments.push(payment);
      subscription.save();
      await UserModel.findOneAndUpdate({ _ud: subscription.user_id }, { key: subscription.key });
      await this.redisService.deleteValue(token);
    } catch (error: any) {
      throw SubscriptionException.ReceivePaymentInfoException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async payForSubscription(token: string) {
    const subscription = JSON.parse(await this.redisService.getValue(token));
    if (!subscription) throw SubscriptionException.InvalidTokenException(token, HttpStatus.BAD_GATEWAY || HttpStatus.INTERNAL_SERVER_ERROR);
    const tier = await SalesTierModel.findById(subscription.tier_id);
    if (!tier || tier.expiration_date < new Date(Date.now())) throw SubscriptionException.SubscriptionExpiredException();
    await this.redisService.extendTtL(token, 1800);
    this.initPayment(token);
  }

  private initRefund(key: string): Promise<string> {}

  async receiveRefundInfo(payment: RefundDto): Promise<RefundDto> {
    try {
    } catch (error: any) {}
  }

  private async refundSubscription(id: string) {}

  async prolongSubscription(user_id: string, subscription_id: string) {
    const subscription = await SubscriptionModel.findById(subscription_id);
    if (!subscription)
      throw SubscriptionException.SubscriptionNotFoundException(
        subscription_id,
        HttpStatus.BAD_REQUEST || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    const tier_id = subscription.tier_id;
    const tier = await SalesTierModel.findById(tier_id);
    if (!tier || tier.expiration_date < new Date(Date.now())) throw SubscriptionException.SubscriptionExpiredException();
    const token = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    try {
      await this.redisService.setValue(
        token,
        JSON.stringify({
          user_id,
          tier_id,
          key: subscription.key,
          duration: tier.duration,
        }),
        86400 * 7,
      );
      this.initPayment(token);
    } catch (error: any) {
      throw SubscriptionException.ProlongSubscriptionException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  promoteSubscription(id: string, tier_id: string) {}

  cancelSubscription(id: string): Promise<string> {}

  async getSubscriptionById(id: string): Promise<SubscriptionDto> {
    try {
      const subscription: SubscriptionDto | null = await SubscriptionModel.findById(id);
      if (!subscription)
        throw SubscriptionException.SubscriptionNotFoundException(id, HttpStatus.BAD_REQUEST || HttpStatus.INTERNAL_SERVER_ERROR);
      return subscription;
    } catch (error: any) {
      throw SubscriptionException.SubscriptionReceivingException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getExpirationDateById(id: string): Promise<Date> {
    const subscription: SubscriptionDto | null = await SubscriptionModel.findById(id);
    if (!subscription)
      throw SubscriptionException.SubscriptionNotFoundException(id, HttpStatus.BAD_REQUEST || HttpStatus.INTERNAL_SERVER_ERROR);
    return subscription.expiration_date;
  }

  async toggleSubscription(id: string, active: boolean) {
    return SubscriptionModel.findByIdAndUpdate({ _id: id }, { is_active: active });
  }

  async removeSubscriptionById(id: string) {
    try {
      const subscription = await SubscriptionModel.deleteOne({ _id: id, is_active: false });
      if (subscription.deletedCount === 0)
        throw SubscriptionException.SubscriptionNotFoundExceptionOrActive(id, HttpStatus.BAD_REQUEST || HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (error: any) {
      throw SubscriptionException.SubscriptionDeletingException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
