import { HttpException, HttpStatus } from "@nestjs/common";
import { UserErrors } from "./user-errors.class";

export class UserException {
  static GetAllUsersException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.GET_ALL_USERS + message, status);
  }

  static GetUserException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.GET_USER + message, status);
  }

  static GetOffersException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.GET_OFFERS + message, status);
  }

  static CreateDraftOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.POST_CREATE_DRAFT_OFFER + message, status);
  }

  static PublishOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.POST_PUBLISH_OFFER + message, status);
  }

  static PublishDraftOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_PUBLISH_DRAFT_OFFER + message, status);
  }

  static UpdatePasswordException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_UPDATE_PASSWORD + message, status);
  }

  static StartResetPasswordException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_START_RESET_PASSWORD + message, status);
  }

  static FinishResetPasswordException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_FINISH_RESET_PASSWORD + message, status);
  }

  static CopyToGroupException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_COPY_TO_GROUP + message, status);
  }

  static MoveToGroupException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_MOVE_TO_GROUP + message, status);
  }

  static UnpublishOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_UNPUBLISH_OFFER + message, status);
  }

  static DraftifyOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_DRAFTIFY_OFFER + message, status);
  }

  static DuplicateDraftOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.PUT_DUPLICATE_DRAFT_OFFER + message, status);
  }

  static RemoveOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.DELETE_REMOVE_OFFER + message, status);
  }

  static RemoveUserException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.DELETE_REMOVE_USER + message, status);
  }

  static AddSubscriptionException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(UserErrors.POST_ADD_SUBSCRIPTION + message, status);
  }
}
