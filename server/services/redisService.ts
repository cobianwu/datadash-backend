import { Redis } from '@upstash/redis';

// Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RedisService {
  private static instance: RedisService;

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async get(key: string): Promise<any> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.set(key, serialized, { ex: ttl });
      } else {
        await redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async getSession(sessionId: string): Promise<any> {
    return await this.get(`session:${sessionId}`);
  }

  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    return await this.set(`session:${sessionId}`, data, ttl);
  }

  async getCachedQuery(queryHash: string): Promise<any> {
    return await this.get(`query:${queryHash}`);
  }

  async setCachedQuery(queryHash: string, result: any, ttl = 3600): Promise<boolean> {
    return await this.set(`query:${queryHash}`, result, ttl);
  }

  async getCachedAnalytics(dataSourceId: number, analysisType: string): Promise<any> {
    return await this.get(`analytics:${dataSourceId}:${analysisType}`);
  }

  async setCachedAnalytics(dataSourceId: number, analysisType: string, result: any, ttl = 7200): Promise<boolean> {
    return await this.set(`analytics:${dataSourceId}:${analysisType}`, result, ttl);
  }
}
