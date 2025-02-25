import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
@Injectable()
export class RedisService {
  constructor(
    @InjectRedis()
    private readonly redisClient: Redis
  ) {}

  async get(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) await this.redisClient.set(key, value, 'EX', ttl); // 'EX' : seconds
    else await this.redisClient.set(key, value);
  }
}