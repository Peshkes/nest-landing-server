import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import SubscriptionModel from "../persistanse/subscription.model";
import { SubscriptionDto } from "../../share/dto/subscription.dto";
import { v4 as uuidv4 } from "uuid";
import { PaymentDto } from "../dto/payment.dto";
import SalesTierModel from "../../tier/persistance/sales-tier.model";
import { SubscriptionException } from "../errors/subscription-exception.classes";
import { RedisService } from "../../redis/service/redis.service";
import UserModel from "../../authentication/persistence/user.model";
import { PaymentCheckData, SalesTier } from "../types";
import { RefundDto } from "../dto/refund.dto";
import PaymentModel from "../persistanse/payment.model";
import { PaymentStatus } from "../dto/payment-status.enum";
import { ClientSession } from "mongoose";
import { runSession } from "../../share/functions/run-session";
import { PaymentSystems } from "../dto/payment-systems.enum";

@Injectable()
export class SubscriptionService {
  constructor(private readonly redisService: RedisService) {}

  async createNewSubscription(user_id: string, tier_id: string, payment_system: PaymentSystems) {
    return this.runSubscriptionSession(async (session) => {
      const { tier } = await this.checkIds(user_id, tier_id);
      this.initPayment(await this.addSubscription(user_id, tier, payment_system, session));
    }, SubscriptionException.CreateNewSubscriptionException);
  }

  private async addSubscription(user_id: string, tier: SalesTier, payment_system: PaymentSystems, session: ClientSession): Promise<string> {
    const key = uuidv4();
    const subscription = new SubscriptionModel({
      tier_id: tier._id,
      key,
    });
    subscription.payments_ids.push(await this.createPayment(tier.price, payment_system, session, tier.duration, key));
    await subscription.save({ session });
    await UserModel.findOneAndUpdate({ user_id }, { key });
    return key;
  }

  private async createPayment(sum: number, payment_system: PaymentSystems, session: ClientSession, duration: number, key: string) {
    const newPayment = new PaymentModel({
      sum,
      payment_system,
      status: PaymentStatus.INITIALIZED,
    });
    const data: PaymentCheckData = { payment_id: newPayment._id, sum, duration };
    try {
      await this.redisService.setValue(key, JSON.stringify(data), 1800);
      await newPayment.save({ session });
      return newPayment._id;
    } catch (error: any) {
      throw SubscriptionException.CreateNewPaymentException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private initPayment(key: string) {}

  async receivePaymentInfo(receivedPaymentInfo: PaymentDto) {
    return this.runSubscriptionSession(async (session) => {
      const key = receivedPaymentInfo.key;
      const redisPayment = JSON.parse(await this.redisService.getValue(key));
      if (!redisPayment) throw SubscriptionException.InvalidTokenException(key, HttpStatus.BAD_GATEWAY || HttpStatus.INTERNAL_SERVER_ERROR);
      if (receivedPaymentInfo.sum !== redisPayment.sum)
        throw SubscriptionException.WrongPaymentException(key, HttpStatus.BAD_GATEWAY || HttpStatus.INTERNAL_SERVER_ERROR);
      const duration: number = redisPayment.duration;
      const receivedDescription = receivedPaymentInfo.description;
      await SubscriptionModel.findOneAndUpdate(
        { key },
        {
          is_active: true,
          start_date: new Date(Date.now()),
          expiration_date: duration && new Date(Date.now() + duration),
          $push: { description: receivedDescription && "/n" + receivedDescription },
        },
        { new: true, session },
      );
      await PaymentModel.findOneAndUpdate(
        { _id: redisPayment.payment_id },
        {
          status: receivedPaymentInfo.status,
          transaction_id: receivedPaymentInfo.transaction_id,
          description: receivedPaymentInfo.transaction_id,
          payment_details: receivedPaymentInfo.payment_details,
        },
        { new: true, session },
      );
      await this.redisService.deleteValue(key);
    }, SubscriptionException.ReceivePaymentInfoException);
  }

  async prolongOrPromoteSubscription(user_id: string, subscription_id: string, tier_id: string, payment_system: PaymentSystems) {
    return this.runSubscriptionSession(async (session) => {
      const { subscription, tier } = await this.checkIds(user_id, subscription_id, tier_id);
      const sum = tier.price;
      let key: string;
      if (subscription.tier_id !== tier_id) {
        key = await this.addSubscription(user_id, tier, payment_system, session);
      } else {
        key = subscription.key;
      }
      const data: PaymentCheckData = {
        payment_id: await this.createPayment(sum, payment_system, session, tier.duration, key),
        sum,
        duration: tier.duration,
      };
      await this.redisService.setValue(key, JSON.stringify(data), 1800);
      this.initPayment(key);
    }, SubscriptionException.ProlongOrPromoteSubscriptionException);
  }

  // async promoteSubscription(user_id: string, subscription_id: string, tier_id: string, payment_system: PaymentSystems) {
  //   const { subscription, tier } = await this.checkIds(user_id, subscription_id, tier_id);
  //   //const data: AlterSubscription = { user_id, key: subscription.key };
  //   //private async createPayment(sum: number, payment_system: PaymentSystems, session: ClientSession, duration: number, key: string) {
  //
  //   const data: PaymentCheckData = {
  //     payment_id: await this.createPayment(tier.price, payment_system, session, tier.duration),
  //     sum,
  //     duration
  //   };
  //   if (subscription.tier_id !== tier_id) {
  //     data.tier_id = tier_id;
  //     data.duration = tier.duration;
  //   }
  //   try {
  //     await this.redisService.setValue(token, JSON.stringify(data), 86400 * 7);
  //     this.initPayment(token);
  //   } catch (error: any) {
  //     throw SubscriptionException.ProlongOrPromoteSubscriptionException(
  //       error.message,
  //       error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  async cancelSubscription(subscription_id: string) {
    const { subscription } = await this.checkIds(subscription_id);
    this.initRefund(subscription.key);
  }

  private initRefund(key: string) {}

  async receiveRefundInfo(refund: RefundDto) {
    const key = refund.key;
    try {
      const subscription = await SubscriptionModel.findOne({ key });
      if (!subscription)
        throw SubscriptionException.SubscriptionKeyNotFoundException(key, HttpStatus.BAD_REQUEST || HttpStatus.INTERNAL_SERVER_ERROR);
      subscription.is_active = false;
      const description = refund.description;
      if (description) subscription.description += "/n" + description;
      subscription.payments_ids.push(refund.payment_id);
      subscription.save();
    } catch (error: any) {
      throw SubscriptionException.ReceiveRefundInfoException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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

  //Utils
  private async checkIds(user_id?: string, subscription_id?: string, tier_id?: string) {
    try {
      if (user_id && !(await UserModel.exists({ user_id })))
        throw SubscriptionException.UserNotFoundException(user_id, HttpStatus.BAD_REQUEST || HttpStatus.INTERNAL_SERVER_ERROR);
      const subscription = subscription_id && (await SubscriptionModel.findById(subscription_id));
      if (!subscription)
        throw SubscriptionException.SubscriptionNotFoundException(
          subscription_id,
          HttpStatus.BAD_REQUEST || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      const tier: SalesTier = tier_id && (await SalesTierModel.findById(subscription_id));
      if (!tier || tier.expiration_date < new Date(Date.now())) throw SubscriptionException.SubscriptionExpiredException();
      return { subscription, tier };
    } catch (error: any) {
      throw SubscriptionException.CheckIdsException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async runSubscriptionSession(
    callback: (session: ClientSession) => Promise<any>,
    customError: (message: string, status?: HttpStatus) => HttpException,
  ) {
    return await runSession(SubscriptionModel, callback, customError);
  }
}
