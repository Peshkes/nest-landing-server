import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PaymentDto } from "../dto/payment.dto";
import { SubscriptionException } from "../errors/subscription-exception.classes";
import { RedisService } from "../../redis/service/redis.service";
import { PaymentCheckData, PaymentStatus, Statuses } from "../subscription.types";
import { RefundDto } from "../dto/refund.dto";
import { ClientSession, Model } from "mongoose";
import { runSession } from "../../share/functions/run-session";
import { SubscriptionErrors } from "../errors/subscription-errors.class";
import { TierServiceSales } from "../../tier/service/tier.service.sales";
import { PaymentSystems, SalesTier } from "../../share/share.types";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PaymentDocument } from "../persistanse/payment.schema";
import { SubscriptionDocument } from "../persistanse/subscription.schema";

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(PaymentDocument.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(SubscriptionDocument.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly redisService: RedisService,
    private readonly tierServiceSales: TierServiceSales,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createNewSubscription(user_id: string, tier_id: string, payment_system: PaymentSystems): Promise<string> {
    return this.runSubscriptionSession(async (session) => {
      const tier = await this.getTier(tier_id, session);
      return await this.addSubscription(user_id, tier, payment_system, session);
    }, SubscriptionException.CreateNewSubscriptionException);
  }

  private async addSubscription(user_id: string, tier: SalesTier, payment_system: PaymentSystems, session: ClientSession): Promise<string> {
    const key = uuidv4();
    const subscription = new this.subscriptionModel({
      tier_id: tier._id,
      key,
    });
    const payment_id = await this.createPayment(tier.price, payment_system, session, tier.duration, key);
    subscription.payments_ids.push(payment_id);
    await Promise.all([subscription.save({ session }), this.addSubscriptionToUser(user_id, subscription._id, session)]);

    this.initPayment(key, payment_id);
    return subscription._id;
  }

  private async createPayment(sum: number, payment_system: PaymentSystems, session: ClientSession, duration: number, key: string) {
    const newPayment = new this.paymentModel({
      sum,
      payment_system,
      status: PaymentStatus.INITIALIZED,
    });
    const data: PaymentCheckData = { _id: newPayment._id, sum, duration, status: PaymentStatus.INITIALIZED };
    const redisPromise = this.redisService.setValue(key, JSON.stringify(data), 1800);
    const mongoPromise = newPayment.save({ session });
    await Promise.all([redisPromise, mongoPromise]);
    return newPayment._id;
  }

  private initPayment(key: string, payment_id: string) {}

  async receivePaymentInfo(receivedPaymentInfo: PaymentDto) {
    return this.runSubscriptionSession(async (session) => {
      const key = receivedPaymentInfo.key;
      let storedPayment: PaymentCheckData = JSON.parse(await this.redisService.getValue(key));
      await this.redisService.extendTtl(key, 1800);
      if (!storedPayment) {
        storedPayment = await this.paymentModel.findById(receivedPaymentInfo.payment_id).select("-description -payment_details").lean();
        await this.redisService.setValue(key, JSON.stringify(storedPayment), 1800);
      }
      if (receivedPaymentInfo.sum !== storedPayment.sum) this.cancelPayment(receivedPaymentInfo.payment_id);
      const receivedStatus = receivedPaymentInfo.status;
      if (
        (receivedStatus !== Statuses.failed.name && Statuses[receivedStatus].weight <= Statuses[storedPayment.status].weight) ||
        (receivedStatus === Statuses.failed.name && Statuses[storedPayment.status].name === Statuses.failed.name)
      )
        return;
      if (
        (receivedStatus === Statuses.failed.name && Statuses[storedPayment.status].name === Statuses.success.name) ||
        (receivedStatus === Statuses.success.name && Statuses[storedPayment.status].name === Statuses.failed.name)
      )
        this.confirmStatus(receivedPaymentInfo.payment_id);
      const duration: number = storedPayment.duration;
      const receivedDescription = receivedPaymentInfo.description;

      await this.paymentModel.findOneAndUpdate(
        { _id: storedPayment._id },
        {
          status: receivedPaymentInfo.status,
          transaction_id: receivedPaymentInfo.transaction_id,
          description: receivedPaymentInfo.transaction_id,
          payment_details: receivedPaymentInfo.payment_details,
        },
        { new: true, session },
      );
      if (receivedStatus === Statuses.success.name) {
        await this.subscriptionModel.findOneAndUpdate(
          { key },
          {
            is_active: true,
            start_date: new Date(Date.now()),
            expiration_date: duration && new Date(Date.now() + duration),
            $push: { description: receivedDescription && "/n" + receivedDescription },
          },
          { new: true, session },
        );
      }
    }, SubscriptionException.ReceivePaymentInfoException);
  }

  async prolongOrPromoteSubscription(
    user_id: string,
    subscription_id: string,
    tier_id: string,
    payment_system: PaymentSystems,
  ): Promise<string> {
    return this.runSubscriptionSession(async (session) => {
      const tierPromise = this.getTier(tier_id, session);
      const subscriptionPromise = this.getSubscription(subscription_id, session);
      const [tier, subscription] = await Promise.all([tierPromise, subscriptionPromise]);
      const sum = tier.price;
      let key: string;
      if (subscription.tier_id !== tier_id) {
        key = await this.addSubscription(user_id, tier, payment_system, session);
      } else {
        key = subscription.key;
        const payment_id = await this.createPayment(sum, payment_system, session, tier.duration, key);
        this.initPayment(key, payment_id);
      }
      return key;
    }, SubscriptionException.ProlongOrPromoteSubscriptionException);
  }

  async cancelSubscription(subscription_id: string) {
    return this.runSubscriptionSession(async (session) => {
      const subscription = await this.getSubscription(subscription_id, session);
      this.initRefund(subscription.key);
    }, SubscriptionException.CancelSubscriptionException);
  }

  private initRefund(key: string) {}

  private cancelPayment(paymentId: string) {}

  private confirmStatus(paymentId: string) {}

  async receiveRefundInfo(refund: RefundDto) {
    const key = refund.key;
    try {
      const subscription = await this.subscriptionModel.findOne({ key });
      if (!subscription) throw SubscriptionException.SubscriptionKeyNotFoundException(key, HttpStatus.BAD_REQUEST);
      subscription.is_active = false;
      const description = refund.description;
      if (description) subscription.description += "/n" + description;
      subscription.payments_ids.push(refund.payment_id);
      subscription.save();
    } catch (error: any) {
      throw SubscriptionException.ReceiveRefundInfoException(error.message, error.statusCode);
    }
  }

  async getSubscriptionById(id: string) {
    try {
      return this.getSubscription(id);
    } catch (error: any) {
      throw SubscriptionException.SubscriptionReceivingException(error.message, error.statusCode);
    }
  }

  async getExpirationDateById(id: string): Promise<Date> {
    const subscription = await this.getSubscriptionById(id);
    return subscription.expiration_date;
  }

  async toggleSubscription(id: string) {
    return this.subscriptionModel.findByIdAndUpdate({ _id: id }, { $bit: { is_active: { xor: 1 } } }, { new: true });
  }

  async removeSubscriptionById(id: string) {
    try {
      const subscription = await this.subscriptionModel.deleteOne({ _id: id, is_active: false });
      if (subscription.deletedCount === 0) throw new BadRequestException(SubscriptionErrors.SUBSCRIPTION_NOT_FOUND_OR_ACTIVE);
    } catch (error: any) {
      throw SubscriptionException.SubscriptionDeletingException(error.message, error.statusCode);
    }
  }

  //Utils
  private async getTier(tier_id: string, session: ClientSession): Promise<SalesTier> {
    const tier: SalesTier = await this.tierServiceSales.getSessionedSalesTierById(tier_id, session);
    if (!tier || tier.expiration_date < new Date(Date.now())) throw new BadRequestException(SubscriptionErrors.POST_SUBSCRIPTION_EXPIRED);
    return tier;
  }

  private async getSubscription(subscription_id: string, session?: ClientSession) {
    const subscription = await this.subscriptionModel.findById(subscription_id).session(session);
    if (!subscription) throw new BadRequestException(SubscriptionErrors.SUBSCRIPTION_NOT_FOUND);
    return subscription;
  }

  private async runSubscriptionSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(this.subscriptionModel, callback, customError);
  }

  //Producers
  private async userExistsById(userId: string, session: ClientSession): Promise<boolean> {
    return new Promise((resolve) => {
      this.eventEmitter.emitAsync("user.exists", userId, resolve, session);
    });
  }

  private async addSubscriptionToUser(userId: string, subscriptionId: string, session: ClientSession): Promise<void> {
    return new Promise((resolve) => {
      this.eventEmitter.emitAsync("user.add-subscription", userId, subscriptionId, resolve, session);
    });
  }
}
