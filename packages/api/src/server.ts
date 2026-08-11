import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { config } from './config';

// Import plugins
import prismaPlugin from './plugins/prisma';
import redisPlugin from './plugins/redis';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';

// Import routes
import routes from './routes';

const app = fastify({ logger: true });

export async function buildApp() {
  // Register plugins
  await app.register(cors, { origin: true });
  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(jwt, { secret: config.JWT_SECRET });
  await app.register(errorHandlerPlugin);
  
  // Register database plugins
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  
  // Register auth plugin
  await app.register(authPlugin);
  
  // Register routes
  await app.register(routes);
  
  return app;
}

// Start server if run directly
const start = async () => {
  try {
    const server = await buildApp();
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`Server running on port ${config.PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

export default app;
