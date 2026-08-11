import fp from 'fastify-plugin';
import Redis from 'ioredis';

// Create Redis connection
const createRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  return new Redis(redisUrl);
};

// Decorate Fastify instance with Redis client
export default fp(async (app) => {
  const redis = createRedisConnection();
  
  app.decorate('redis', redis);
  
  app.addHook('onClose', async () => {
    await redis.quit();
  });
});

// TypeScript declaration
declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}