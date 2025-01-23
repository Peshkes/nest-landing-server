import { HttpException, HttpStatus } from "@nestjs/common";
import { SubscriptionErrors } from "./subscription-errors.class";

export class SubscriptionException {
  static ReceivePaymentInfoException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.PUT_RECEIVE_PAYMENT + message, status);
  }

  static CreateNewSubscriptionException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.POST_CREATE_SUBSCRIPTION + message, status);
  }

  static ProlongSubscriptionException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.POST_PROLONG_SUBSCRIPTION + message, status);
  }

  static SubscriptionNotFoundException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.SUBSCRIPTION_NOT_FOUND + message, status);
  }

  static SubscriptionNotFoundExceptionOrActive(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.SUBSCRIPTION_NOT_FOUND_OR_ACTIVE + message, status);
  }

  static SubscriptionDeletingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.SUBSCRIPTION_DELETING_ERROR + message, status);
  }

  static SubscriptionReceivingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.SUBSCRIPTION_RECEIVING_ERROR + message, status);
  }

  static SubscriptionExpiredException(status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.POST_SUBSCRIPTION_EXPIRED, status);
  }
  static InvalidTokenException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(SubscriptionErrors.INVALID_TOKEN + message, status);
  }
}
