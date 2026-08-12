import { z } from 'zod';

const configSchema = z.object({
  port: z.number().default(3001),
  host: z.string().default('0.0.0.0'),
  databaseUrl: z.string(),
  redisUrl: z.string(),
  jwtSecret: z.string(),
  encryptionKey: z.string(),
  firebaseProjectId: z.string(),
  firebaseClientEmail: z.string(),
  firebasePrivateKey: z.string(),
  firebaseStorageBucket: z.string().optional(),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
});

function getConfig() {
  const c = {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    databaseUrl: process.env.DATABASE_URL!,
    redisUrl: process.env.REDIS_URL!,
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production-1234567890',
    encryptionKey: process.env.ENCRYPTION_KEY || 'dev-key-change-in-production-12345',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID!,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY!,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    nodeEnv: process.env.NODE_ENV || 'development',
  };

  try {
    return configSchema.parse(c);
  } catch (error) {
    console.error('Config validation error:', JSON.stringify(error, null, 2));
    throw new Error('Invalid configuration');
  }
}

export type Config = z.infer<typeof configSchema>;
export const config = getConfig();
