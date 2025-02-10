export class SubscriptionErrors {
  public static readonly PUT_RECEIVE_PAYMENT = "Ошибка при оплате подписки: ";
  public static readonly PUT_RECEIVE_REFUND = "Ошибка при возврате отплаты за подписки: ";
  public static readonly POST_CREATE_SUBSCRIPTION = "Ошибка при создании подписки: ";
  public static readonly POST_PROLONG_SUBSCRIPTION = "Ошибка при продлении подписки: ";
  public static readonly POST_SUBSCRIPTION_EXPIRED = "К сожалению срок действия предложения истек. Пожалуйста, выберете другой тариф";
  public static readonly SUBSCRIPTION_NOT_FOUND = "Подписки с таким ID не найдено: ";
  public static readonly SUBSCRIPTION_KEY_NOT_FOUND = "Подписки с таким ключем не найдено: ";
  public static readonly USER_NOT_FOUND = "Пользоваткль с таким ID не найден: ";
  public static readonly SUBSCRIPTION_NOT_FOUND_OR_ACTIVE = "Подписки с таким ID не найдено или она активна: ";
  public static readonly SUBSCRIPTION_DELETING_ERROR = "Ошибка при удлении подписки: ";
  public static readonly SUBSCRIPTION_RECEIVING_ERROR = "Ошибка при получении подписки: ";
  public static readonly INVALID_TOKEN = "Шаблона подписки с тами токеном не найдно: ";
  public static readonly INVALID_ID = "Один из объектов не был найден: ";
  public static readonly PAYMENT_CREATING_ERROR = "Ошибка при создании платежа: ";
  public static readonly WRONG_PAYMENT_ERROR = "Ошибка при проведении платежа: ";
  public static readonly CANCEL_SUBSCRIPTION_ERROR = "Ошибка отмене подписки: ";
}
