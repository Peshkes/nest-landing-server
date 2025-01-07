import { Injectable } from "@nestjs/common";
import SubscriptionModel from "../persistanse/subscriptionModel";
import { SubscriptionDto } from "../../share/dto/SubscriptionDto";

@Injectable()
export class SubscriptionService {
  createNewSubscription = async (subscription: SubscriptionDto): Promise<string> => {
    try {
      const { key, tierId, startDate, isActive, payments, expirationDate } = subscription;
      const newSubscription = new SubscriptionModel({
        key,
        tierId,
        startDate,
        isActive,
        payments,
        expirationDate,
      });
      const savedSubscription = await newSubscription.save();
      return savedSubscription._id.toString();
    } catch (error: any) {
      throw new Error(`Ошибка при создании подписки: ${error.message}`);
    }
  };
}
