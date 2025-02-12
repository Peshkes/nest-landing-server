export class UserErrors {
  public static readonly GET_ALL_USERS = "Ошибка при получении всех пользователей: ";
  public static readonly GET_USER = "Ошибка при получении пользователя: ";
  public static readonly GET_OFFERS = "Ошибка при получении офферов пользователя: ";

  public static readonly POST_CREATE_DRAFT_OFFER = "Ошибка при создании черновика оффера: ";
  public static readonly POST_PUBLISH_OFFER = "Ошибка при публикации оффера без черновика: ";
  public static readonly POST_ADD_SUBSCRIPTION = "Ошибка при добавлении подписки: ";

  public static readonly PUT_PUBLISH_DRAFT_OFFER = "Ошибка при публикации чернового оффера: ";
  public static readonly PUT_COPY_TO_GROUP = "Ошибка при копировании офферов в группу: ";
  public static readonly PUT_MOVE_TO_GROUP = "Ошибка при перемещении офферов в группу: ";
  public static readonly PUT_UNPUBLISH_OFFER = "Ошибка при снятии оффера с публикации: ";
  public static readonly PUT_DRAFTIFY_OFFER = "Ошибка при переводе оффера в черновик: ";
  public static readonly PUT_DUPLICATE_DRAFT_OFFER = "Ошибка при дублировании чернового оффера: ";

  public static readonly DELETE_REMOVE_OFFER = "Ошибка при удалении оффера: ";
  public static readonly DELETE_REMOVE_USER = "Ошибка при удалении пользователя: ";
}
