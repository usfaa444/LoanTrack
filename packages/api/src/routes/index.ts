import { FastifyInstance } from 'fastify';

// Import route modules
import authEmailRegisterRoutes from './auth/email-register';
import authFirebaseTokenRoutes from './auth/firebase-token';
import authPhoneSendRoutes from './auth/phone-send';
import authPhoneVerifyRoutes from './auth/phone-verify';
import authPinSetupRoutes from './auth/pin-setup';
import authPinVerifyRoutes from './auth/pin-verify';
import loansRoutes from './loans';
import loanPaymentsRoutes from './loans/payments';
import dashboardRoutes from './dashboard';
import notificationsRoutes from './notifications';
import devicesRoutes from './devices';

// Register all routes
export default async function routes(app: FastifyInstance) {
  // Health check route
  app.get('/health', {
    schema: {
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' }
          }
        }
      }
    }
  }, async () => {
    return { status: 'ok' };
  });
  
  // Register auth routes
  await app.register(authEmailRegisterRoutes, { prefix: '/v1/auth' });
  await app.register(authFirebaseTokenRoutes, { prefix: '/v1/auth' });
  await app.register(authPhoneSendRoutes, { prefix: '/v1/auth' });
  await app.register(authPhoneVerifyRoutes, { prefix: '/v1/auth' });
  await app.register(authPinSetupRoutes, { prefix: '/v1/auth' });
  await app.register(authPinVerifyRoutes, { prefix: '/v1/auth' });
  
  // Register core API routes
  await app.register(loansRoutes, { prefix: '/v1/loans' });
  await app.register(loanPaymentsRoutes, { prefix: '/v1/loans' });
  await app.register(dashboardRoutes, { prefix: '/v1/dashboard' });
  await app.register(notificationsRoutes, { prefix: '/v1/notifications' });
  await app.register(devicesRoutes, { prefix: '/v1/devices' });
}