import { HttpStatus, Injectable } from "@nestjs/common";
import SubscriptionModel from "../persistanse/subscription.model";
import { SubscriptionDto } from "../../share/dto/subscription.dto";
import { v4 as uuidv4 } from "uuid";
import { PaymentDto } from "../dto/payment.dto";
import SalesTierModel from "../../tier/persistance/sales-tier.model";
import { GroupException } from "../../group/errors/group-exception.classes";
import { SubscriptionException } from "../errors/subscription-exception.classes";

@Injectable()
export class SubscriptionService {
  createNewSubscription = async (tier_id: string): Promise<string> => {
    const tier = await SalesTierModel.findById(tier_id);
    if (!tier || tier.expiration_date < new Date(Date.now()))
      throw new Error(`К сожалению предложение закончилось.Пожалуйста, выберете другой тариф`);
    try {
      const key = uuidv4();
      const savedSubscription = await new SubscriptionModel({
        key,
        tier_id,
      }).save();
      this.initPayment(key, tier.duration);
      return savedSubscription._id.toString();
    } catch (error: any) {
      throw new Error(`Ошибка при создании подписки: ${error.message}`);
    }
  };

  private initPayment(key: string, duration: number) {}

  async receivePaymentInfo(payment: PaymentDto) {
    try {
      const subscription: SubscriptionDto | null = await SubscriptionModel.findOne({ key: payment.key });
      if (subscription) {
        subscription.is_active = true;
        subscription.start_date = new Date(Date.now());
        subscription.expiration_date = new Date(Date.now() + payment.duration);
        subscription.payments.push(payment);
      }
    } catch (error: any) {
      throw SubscriptionException.ReceivePaymentInfoException(error.message, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  payForSubscription(id: string) {}

  refundSubscription(id: string) {}

  prolongSubscription(id: string) {}

  promoteSubscription(id: string, tier_id: string) {}

  cancelSubscription(id: string): Promise<string> {}

  private initRefund(id: string): Promise<string> {}

  async receiveRefundInfo(payment: RefundDto): Promise<RefundDto> {
    try {
    } catch (error: any) {}
  }

  async getSubscriptionById(id: string): Promise<SubscriptionDto> {
    try {
      const subscription: SubscriptionDto | null = await SubscriptionModel.findById(id);
      if (!subscription) throw new Error("Подписки предложения с таким ID: " + id + " не найдено");
      return subscription;
    } catch (error: any) {
      throw new Error(`Ошибка при получении подписки: ${error.message}`);
    }
  }

  getExpirationDateById(id: string): Promise<string> {}

  private checkExpirationDate() {}

  toggleSubscription(id: string) {}

  async removeSubscriptionById(id: string): Promise<SubscriptionDto> {
    try {
      const subscription: SubscriptionDto | null = await SubscriptionModel.findByIdAndDelete(id);
      if (!subscription) throw new Error("Подписки с таким ID: " + id + " не найдено");
      return subscription;
    } catch (error: any) {
      throw new Error(`Ошибка при удлении подписки: ${error.message}`);
    }
  }
}
