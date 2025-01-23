import { HttpException, HttpStatus } from "@nestjs/common";
import { SubscriptionErrors } from "./subscription-errors.class";

export class SubscriptionException {
  static ReceivePaymentInfoException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.PUT_RECEIVE_PAYMENT + message, status);
  }
}
