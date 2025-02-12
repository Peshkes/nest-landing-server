import { HttpException, HttpStatus } from "@nestjs/common";
import { GroupErrors } from "./group-errors.class";

export class GroupException {
  static CreateGroupException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.POST_CREATE_GROUP + message, status);
  }

  static GetGroupException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.GET_GROUP + message, status);
  }

  static GetGroupWithAdditionalDataException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.GET_GROUP_WITH_ADDITIONAL_DATA + message, status);
  }

  static GetGroupsPreviewsException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.GET_GROUPS_PREVIEWS + message, status);
  }

  static GetGroupsWithPagination(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.GET_GROUPS_PREVIEWS_WITH_PAGINATION + message, status);
  }

  static GetGroupMembersException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.GET_GROUP_MEMBERS + message, status);
  }

  static StartAddingMemberException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.POST_START_ADDING_MEMBER + message, status);
  }

  static FinishAddingMemberException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.POST_FINISH_ADDING_MEMBER + message, status);
  }

  static CreateDraftException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.POST_CREATE_DRAFT + message, status);
  }

  static PublishOfferWithoutDraftException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.POST_PUBLISH_OFFER_WITHOUT_DRAFT + message, status);
  }

  static PublishDraftException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.PUT_PUBLISH_DRAFT + message, status);
  }

  static CopyOfferToUserException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.PUT_COPY_OFFER_TO_USER + message, status);
  }

  static MoveOfferToUserException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.PUT_MOVE_OFFER_TO_USER + message, status);
  }

  static UnpublishPublicException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.PUT_UNPUBLISH_PUBLIC + message, status);
  }

  static DraftifyPublicException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.PUT_DRAFTIFY_PUBLIC + message, status);
  }

  static DuplicateDraftException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.PUT_DUPLICATE_DRAFT + message, status);
  }

  static UpdateSettingsException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.PUT_UPDATE_SETTINGS + message, status);
  }

  static DeleteDraftOfferException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.DELETE_DRAFT_OFFER + message, status);
  }

  static DeleteUserException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.DELETE_USER + message, status);
  }

  static DeleteGroupException(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    return new HttpException(GroupErrors.DELETE_GROUP + message, status);
  }
}
