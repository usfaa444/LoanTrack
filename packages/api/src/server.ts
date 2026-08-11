import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

// Import plugins
import prismaPlugin from './plugins/prisma';
import redisPlugin from './plugins/redis';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';

// Import routes
import routes from './routes';

// Create Fastify instance with TypeBox type provider
const app = fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>();

// Register serializers and validators
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register plugins
await app.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://app.loantrack.app'] 
    : ['http://localhost:3000', 'http://localhost:19006']
});

await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
    }
  }
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'loantrack-secret-key-change-in-production'
});

// Register custom plugins
await app.register(prismaPlugin);
await app.register(redisPlugin);
await app.register(authPlugin);
await app.register(errorHandlerPlugin);

// Register routes
await app.register(routes);

// Start server
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen({ host: HOST, port: PORT }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});