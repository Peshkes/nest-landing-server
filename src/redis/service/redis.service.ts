import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  /**
   * Установить значение в Redis с указанием времени жизни.
   * @param key Ключ
   * @param value Значение
   * @param ttl Время жизни в секундах (опционально, дефолтное значение 86400 (1 сутки))
   */
  async setValue(key: string, value: string, ttl: number = 86400): Promise<void> {
    await this.redisClient.set(key, value, "EX", ttl);
  }

  async getValue(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async deleteValue(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
