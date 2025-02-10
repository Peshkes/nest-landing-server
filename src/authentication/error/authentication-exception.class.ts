import { HttpException, HttpStatus } from "@nestjs/common";
import { AuthErrors } from "./authentication-errors.class";

export class AuthException {
  static RegistrationException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.POST_REGISTRATION + message, status);
  }

  static SignInException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.POST_SIGNIN + message, status);
  }

  static SuperSignInException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.POST_SUPER_SIGNIN + message, status);
  }

  static RefreshException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.POST_REFRESH + message, status);
  }

  static AddSubscriptionException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.POST_ADD_SUBSCRIPTION + message, status);
  }
}
