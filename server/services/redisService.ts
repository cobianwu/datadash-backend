import Redis from 'ioredis';

export class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    // Use default Redis connection or environment variable
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.log('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 2000);
      }
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err.message);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('Redis connection closed');
      this.isConnected = false;
    });
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  isAvailable(): boolean {
    return this.isConnected;
  }

  // Cache management
  async get(key: string): Promise<any> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  // Pattern-based operations
  async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected) return [];
    
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;
    
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;
      
      const pipeline = this.client.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec();
      
      return keys.length;
    } catch (error) {
      console.error('Redis delete pattern error:', error);
      return 0;
    }
  }

  // Query result caching
  async getCachedQuery(queryHash: string): Promise<any> {
    const key = `query:${queryHash}`;
    return await this.get(key);
  }

  async setCachedQuery(queryHash: string, result: any, ttl: number = 3600): Promise<boolean> {
    const key = `query:${queryHash}`;
    return await this.set(key, result, ttl);
  }

  // Analytics caching
  async getCachedAnalytics(dataSourceId: number, analysisType: string): Promise<any> {
    const key = `analytics:${dataSourceId}:${analysisType}`;
    return await this.get(key);
  }

  async setCachedAnalytics(
    dataSourceId: number, 
    analysisType: string, 
    result: any, 
    ttl: number = 7200
  ): Promise<boolean> {
    const key = `analytics:${dataSourceId}:${analysisType}`;
    return await this.set(key, result, ttl);
  }

  // Session management
  async getSession(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.set(key, data, ttl);
  }

  // Real-time collaboration
  async publish(channel: string, message: any): Promise<number> {
    if (!this.isConnected) return 0;
    
    try {
      const serialized = JSON.stringify(message);
      return await this.client.publish(channel, serialized);
    } catch (error) {
      console.error('Redis publish error:', error);
      return 0;
    }
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    if (!this.isConnected) return;
    
    const subscriber = this.client.duplicate();
    
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch (error) {
          console.error('Redis message parse error:', error);
        }
      }
    });
    
    await subscriber.subscribe(channel);
  }

  // Distributed locking
  async acquireLock(resource: string, ttl: number = 5000): Promise<string | null> {
    if (!this.isConnected) return null;
    
    const lockId = `${Date.now()}-${Math.random()}`;
    const key = `lock:${resource}`;
    
    try {
      const result = await this.client.set(key, lockId, 'PX', ttl, 'NX');
      return result === 'OK' ? lockId : null;
    } catch (error) {
      console.error('Redis acquire lock error:', error);
      return null;
    }
  }

  async releaseLock(resource: string, lockId: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    const key = `lock:${resource}`;
    
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    try {
      const result = await this.client.eval(script, 1, key, lockId);
      return result === 1;
    } catch (error) {
      console.error('Redis release lock error:', error);
      return false;
    }
  }

  // Rate limiting
  async checkRateLimit(identifier: string, limit: number, window: number): Promise<boolean> {
    if (!this.isConnected) return true; // Allow if Redis is down
    
    const key = `rate:${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;
    
    try {
      // Remove old entries
      await this.client.zremrangebyscore(key, '-inf', windowStart);
      
      // Count current entries
      const count = await this.client.zcard(key);
      
      if (count < limit) {
        // Add new entry
        await this.client.zadd(key, now, `${now}-${Math.random()}`);
        await this.client.expire(key, window);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return true; // Allow if error
    }
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}