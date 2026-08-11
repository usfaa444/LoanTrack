import { z } from 'zod';

// Define the configuration schema
const configSchema = z.object({
  // Server
  port: z.number().default(3000),
  host: z.string().default('0.0.0.0'),
  
  // Database
  databaseUrl: z.string().url(),
  
  // Redis
  redisUrl: z.string().url(),
  
  // JWT
  jwtSecret: z.string().min(32),
  
  // Encryption
  encryptionKey: z.string().length(32),
  
  // Supabase
  supabaseUrl: z.string().url(),
  supabaseServiceRoleKey: z.string(),
  supabaseAnonKey: z.string(),
  
  // Twilio
  twilioAccountSid: z.string(),
  twilioAuthToken: z.string(),
  twilioVerifyServiceSid: z.string(),
  
  // Africa's Talking
  africastalkingApiKey: z.string(),
  africastalkingUsername: z.string(),
  
  // Firebase
  firebaseProjectId: z.string(),
  firebaseClientEmail: z.string(),
  firebasePrivateKey: z.string(),
  
  // Environment
  nodeEnv: z.enum(['development', 'production', 'test']).default('development')
});

// Load and validate configuration
const getConfig = () => {
  const config = {
    // Server
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    
    // Database
    databaseUrl: process.env.DATABASE_URL!,
    
    // Redis
    redisUrl: process.env.REDIS_URL!,
    
    // JWT
    jwtSecret: process.env.JWT_SECRET!,
    
    // Encryption
    encryptionKey: process.env.ENCRYPTION_KEY!,
    
    // Supabase
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
    
    // Twilio
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN!,
    twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID!,
    
    // Africa's Talking
    africastalkingApiKey: process.env.AFRICASTALKING_API_KEY!,
    africastalkingUsername: process.env.AFRICASTALKING_USERNAME!,
    
    // Firebase
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID!,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY!,
    
    // Environment
    nodeEnv: process.env.NODE_ENV || 'development'
  };

  // Validate the configuration
  try {
    return configSchema.parse(config);
  } catch (error) {
    console.error('Invalid configuration:', error);
    throw new Error('Invalid configuration');
  }
};

export type Config = z.infer<typeof configSchema>;
export const config = getConfig();