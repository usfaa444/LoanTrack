import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';

// Auth routes
import otpSendRoutes from './routes/auth/otp-send';
import otpVerifyRoutes from './routes/auth/otp-verify';
import pinSetupRoutes from './routes/auth/pin-setup';
import pinVerifyRoutes from './routes/auth/pin-verify';
// Core routes
import loansRoutes from './routes/loans';
import paymentsRoutes from './routes/loans/payments';
import dashboardRoutes from './routes/dashboard';
import notificationsRoutes from './routes/notifications';
import devicesRoutes from './routes/devices';

const app = fastify({ logger: true });

async function buildApp() {
  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: config.jwtSecret });
  await app.register(errorHandlerPlugin);
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  app.get('/health', async () => {
    try { await app.db.$queryRaw`SELECT 1`; return { status: 'ok', db: 'connected' }; }
    catch { return { status: 'ok', db: 'disconnected' }; }
  });

  await app.register(otpSendRoutes, { prefix: '/v1/auth' });
  await app.register(otpVerifyRoutes, { prefix: '/v1/auth' });
  await app.register(pinSetupRoutes, { prefix: '/v1/auth' });
  await app.register(pinVerifyRoutes, { prefix: '/v1/auth' });
  await app.register(loansRoutes, { prefix: '/v1/loans' });
  await app.register(paymentsRoutes, { prefix: '/v1/loans' });
  await app.register(dashboardRoutes, { prefix: '/v1/dashboard' });
  await app.register(notificationsRoutes, { prefix: '/v1/notifications' });
  await app.register(devicesRoutes, { prefix: '/v1/devices' });

  return app;
}

const start = async () => {
  try {
    const server = await buildApp();
    await server.listen({ port: config.port, host: '0.0.0.0' });
    console.log('LoanTrack API running on port', config.port);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();