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
  async setValue<T>(key: string, value: T, ttl: number = 86400): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value), "EX", ttl);
  }

  async getValue<R>(key: string): Promise<R> | null {
    const string = await this.redisClient.get(key);
    return JSON.parse(string) as R;
  }

  async deleteValue(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async extendTtl(key: string, ttl: number) {
    await this.redisClient.expire(key, ttl);
  }
}
