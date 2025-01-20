import crypto from "crypto";

class SecretStorage {
  private static instance: SecretStorage;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  // Приватный конструктор запрещает создание новых экземпляров
  private constructor() {
    this.accessTokenSecret = crypto.randomBytes(64).toString("hex");
    this.refreshTokenSecret = crypto.randomBytes(64).toString("hex");
  }

  // Метод для получения единственного экземпляра
  public static getInstance(): SecretStorage {
    if (!SecretStorage.instance) {
      SecretStorage.instance = new SecretStorage();
    }
    return SecretStorage.instance;
  }

  // Методы для доступа к секретам
  public getAccessTokenSecret(): string {
    return this.accessTokenSecret;
  }

  public getRefreshTokenSecret(): string {
    return this.refreshTokenSecret;
  }
}

export default SecretStorage;
