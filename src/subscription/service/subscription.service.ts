import { Injectable } from "@nestjs/common";
import SubscriptionModel from "../persistanse/subscription.model";
import { SubscriptionDto } from "../../share/dto/subscription.dto";

@Injectable()
export class SubscriptionService {
  createNewSubscription = async (subscription: SubscriptionDto): Promise<string> => {
    console.log("subscription started");
    try {
      const { key, tierId, startDate, isActive, payments, expirationDate } = subscription;
      const newSubscription = new SubscriptionModel({
        key,
        tier_id: tierId,
        start_date: startDate,
        is_active: isActive,
        payments,
        expiration_date: expirationDate,
      });
      const savedSubscription = await newSubscription.save();
      return savedSubscription._id.toString();
    } catch (error: any) {
      throw new Error(`Ошибка при создании подписки: ${error.message}`);
    }
  };
}
