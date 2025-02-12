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

  static UpdatePasswordException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.PUT_UPDATE_PASSWORD + message, status);
  }

  static StartResetPasswordException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.PUT_START_RESET_PASSWORD + message, status);
  }

  static FinishResetPasswordException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.PUT_FINISH_RESET_PASSWORD + message, status);
  }

  static StartVerifyEmailException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.PUT_START_VERIFY_EMAIL + message, status);
  }

  static FinishVerifyEmailException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(AuthErrors.PUT_FINISH_VERIFY_EMAIL + message, status);
  }
}
