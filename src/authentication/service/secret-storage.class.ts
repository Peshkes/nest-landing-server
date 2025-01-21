import crypto from "crypto";

class SecretStorageClass {
  private static instance: SecretStorageClass;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  // Приватный конструктор запрещает создание новых экземпляров
  private constructor() {
    this.accessTokenSecret = crypto.randomBytes(64).toString("hex");
    this.refreshTokenSecret = crypto.randomBytes(64).toString("hex");
  }

  // Метод для получения единственного экземпляра
  public static getInstance(): SecretStorageClass {
    if (!SecretStorageClass.instance) {
      SecretStorageClass.instance = new SecretStorageClass();
    }
    return SecretStorageClass.instance;
  }

  // Методы для доступа к секретам
  public getAccessTokenSecret(): string {
    return this.accessTokenSecret;
  }

  public getRefreshTokenSecret(): string {
    return this.refreshTokenSecret;
  }
}

export default SecretStorageClass;
