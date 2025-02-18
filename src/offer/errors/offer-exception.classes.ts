import { HttpException, HttpStatus } from "@nestjs/common";
import { OfferErrors } from "./offer-errors.class";

export class OfferException {
  static CreateNewOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.POST_CREATE_OFFER + message, status);
  }

  static CreateArchiveOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.POST_CREATE_ARCHIVE_OFFER + message, status);
  }

  static OfferDeletingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.OFFER_DELETING_ERROR + message, status);
  }

  static ArchiveOfferDeletingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.ARCHIVE_OFFER_DELETING_ERROR + message, status);
  }

  static PublicOfferDeletingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.PUBLIC_OFFER_DELETING_ERROR + message, status);
  }

  static DraftOfferReceivingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.DRAFT_OFFER_RECEIVING_ERROR + message, status);
  }

  static AllOffersReceivingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.ALL_OFFER_RECEIVING_ERROR + message, status);
  }

  static PublicOfferReceivingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.PUBLIC_OFFER_RECEIVING_ERROR + message, status);
  }

  static DraftOfferListReceivingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.DRAFT_OFFER_LIST_RECEIVING_ERROR + message, status);
  }

  static PublicListReceivingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.PUBLIC_OFFER_LIST_RECEIVING_ERROR + message, status);
  }

  static UpdateOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.OFFER_UPDATE_ERROR + message, status);
  }

  static PublishOfferWithoutDraftException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.NO_DRAFT_OFFER_PUBLISH_ERROR + message, status);
  }

  static SaveDraftOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.SAVE_DRAFT_OFFER_ERROR + message, status);
  }

  static SavePublicOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.SAVE_PUBLIC_OFFER_ERROR + message, status);
  }

  static DuplicateDraftOffersException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.DUPLICATE_DRAFT_OFFER_ERROR + message, status);
  }

  static MoveOffersException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.MOVE_OFFER_ERROR + message, status);
  }

  static UnpublishException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.UNPUBLISH_ERROR + message, status);
  }

  static CopyPublishedToDraftsException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.COPY_PUBLISHED_TO_DRAFTS_ERROR + message, status);
  }

  static CopyOfferBetweenGroupAndUserException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.COPY_BETWEEN_GROUP_AND_USER_ERROR + message, status);
  }

  static DeleteAllOffersByOwnerIdException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.DELETE_ALL_OFFERS_BY_OWNER_ID_ERROR + message, status);
  }

  static AllOffersByGroupReceivingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.ALL_OFFERS_BY_GROUP_ERROR + message, status);
  }

  static AllArchiveOffersReceivingException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.ALL_ARCHIVE_OFFERS_ERROR + message, status);
  }

  static OfferReceivingFromArchiveException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(OfferErrors.OFFER_ARCHIVE_RECEIVING_EXCEPTION + message, status);
  }
}
