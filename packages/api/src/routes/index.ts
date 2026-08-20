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

// NEW: Data-collection routes
import analyticsRoutes from './analytics';
import disputesRoutes from './disputes';
import scoreRoutes from './score';
import badgesRoutes from './badges';
import streaksRoutes from './streaks';
import usersRoutes from './users';

// NEW: Feature routes (Souga-derived)
import loanMemosRoutes from './loans/memos';
import paymentsRoutes from './payments';
import loanReceiptsRoutes from './loans/receipts';
import tontinesRoutes from './tontines';
import whatsappRoutes from './webhooks/whatsapp';
import remindersRoutes from './reminders';

// Register all routes
export default async function routes(app: FastifyInstance) {
  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  // Auth routes
  await app.register(authEmailRegisterRoutes, { prefix: '/v1/auth' });
  await app.register(authFirebaseTokenRoutes, { prefix: '/v1/auth' });
  await app.register(authPhoneSendRoutes, { prefix: '/v1/auth' });
  await app.register(authPhoneVerifyRoutes, { prefix: '/v1/auth' });
  await app.register(authPinSetupRoutes, { prefix: '/v1/auth' });
  await app.register(authPinVerifyRoutes, { prefix: '/v1/auth' });

  // Core API routes
  await app.register(loansRoutes, { prefix: '/v1/loans' });
  await app.register(loanPaymentsRoutes, { prefix: '/v1/loans' });
  await app.register(dashboardRoutes, { prefix: '/v1/dashboard' });
  await app.register(notificationsRoutes, { prefix: '/v1/notifications' });
  await app.register(devicesRoutes, { prefix: '/v1/devices' });

  // NEW: Data-collection routes
  await app.register(analyticsRoutes, { prefix: '/v1/analytics' });
  await app.register(disputesRoutes, { prefix: '/v1/disputes' });
  await app.register(scoreRoutes, { prefix: '/v1/score' });
  await app.register(badgesRoutes, { prefix: '/v1/badges' });
  await app.register(streaksRoutes, { prefix: '/v1/streaks' });
  await app.register(usersRoutes, { prefix: '/v1/users' });

  // NEW: Feature routes (Souga-derived)
  await app.register(loanMemosRoutes, { prefix: '/v1/loans' });
  await app.register(paymentsRoutes, { prefix: '/v1/payments' });
  await app.register(loanReceiptsRoutes, { prefix: '/v1/loans' });
  await app.register(tontinesRoutes, { prefix: '/v1/tontines' });
  await app.register(whatsappRoutes, { prefix: '/v1/whatsapp/webhook' });
  await app.register(remindersRoutes, { prefix: '/v1/reminders' });
}