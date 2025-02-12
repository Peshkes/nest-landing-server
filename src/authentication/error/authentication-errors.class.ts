export class AuthErrors {
  public static readonly POST_REGISTRATION = "Ошибка при регистрации пользователя: ";
  public static readonly POST_SIGNIN = "Ошибка при входе пользователя: ";
  public static readonly POST_SUPER_SIGNIN = "Ошибка при входе суперпользователя: ";
  public static readonly POST_REFRESH = "Ошибка при обновлении токенов: ";

  public static readonly PUT_UPDATE_PASSWORD = "Ошибка при обновлении пароля: ";
  public static readonly PUT_START_RESET_PASSWORD = "Ошибка при запросе на сброс пароля: ";
  public static readonly PUT_FINISH_RESET_PASSWORD = "Ошибка при завершении сброса пароля: ";
  public static readonly PUT_START_VERIFY_EMAIL = "Ошибка при запросе на верификацию почты: ";
  public static readonly PUT_FINISH_VERIFY_EMAIL = "Ошибка при завершении верификации почты: ";
}
