export class GroupErrors {
  public static readonly GET_GROUP = "Ошибка при получении группы: ";
  public static readonly GET_GROUP_WITH_ADDITIONAL_DATA = "Ошибка при получении полной информации о группе: ";
  public static readonly GET_GROUPS_PREVIEWS = "Ошибка при получении списка групп: ";
  public static readonly GET_GROUPS_PREVIEWS_WITH_PAGINATION = "Ошибка при получении списка групп с пагинацией: ";
  public static readonly GET_GROUP_MEMBERS = "Ошибка при получении участников группы: ";

  public static readonly POST_CREATE_GROUP = "Ошибка при создании группы: ";
  public static readonly POST_START_ADDING_MEMBER = "Ошибка при создании запроса на добавление члена группы: ";
  public static readonly POST_FINISH_ADDING_MEMBER = "Ошибка при завершении создания на добавление члена группы: ";
  public static readonly POST_CREATE_DRAFT = "Ошибка при создании группы: ";
  public static readonly POST_PUBLISH_OFFER_WITHOUT_DRAFT = "Ошибка при публикации оффера без черновика: ";

  public static readonly PUT_PUBLISH_DRAFT = "Ошибка при публикации оффера из черновика: ";
  public static readonly PUT_COPY_OFFER_TO_USER = "Ошибка при копировании оффера пользователю: ";
  public static readonly PUT_MOVE_OFFER_TO_USER = "Ошибка при перемещении оффера пользователю: ";
  public static readonly PUT_UNPUBLISH_PUBLIC = "Ошибка при снятии оффера с публикации: ";
  public static readonly PUT_DRAFTIFY_PUBLIC = "Ошибка при создании черновика из публичного оффера: ";
  public static readonly PUT_DUPLICATE_DRAFT = "Ошибка при дублировании черновика: ";
  public static readonly PUT_UPDATE_SETTINGS = "Ошибка при обновлении настроек";

  public static readonly DELETE_DRAFT_OFFER = "Ошибка при удалении черновика из группы: ";
  public static readonly DELETE_USER = "Ошибка при удалении пользователя из группы: ";
  public static readonly DELETE_GROUP = "Ошибка при удалении группы: ";
}
