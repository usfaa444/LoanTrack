import admin from 'firebase-admin';
import { config } from '../config';

let firebaseAdmin: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 * @returns Firebase Admin app instance
 */
function getFirebaseAdmin(): admin.app.App {
  if (!firebaseAdmin) {
    // Check if required Firebase config is available
    if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
      throw new Error('Firebase not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in environment variables');
    }

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebaseProjectId,
        clientEmail: config.firebaseClientEmail,
        privateKey: config.firebasePrivateKey?.replace(/\\n/g, '\n'),
      }),
    });
    
    console.log('[Firebase] Admin SDK initialized successfully');
  }
  
  return firebaseAdmin;
}

/**
 * Create a custom token for a user
 * @param uid User ID
 * @returns Custom token string
 */
export async function createCustomToken(uid: string): Promise<string> {
  const admin = getFirebaseAdmin();
  return admin.auth().createCustomToken(uid);
}

/**
 * Verify a Firebase ID token
 * @param token ID token to verify
 * @returns Decoded token
 */
export async function verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
  const admin = getFirebaseAdmin();
  return admin.auth().verifyIdToken(token);
}

/**
 * Send phone OTP (placeholder - not directly supported by Admin SDK)
 * @param phone Phone number
 * @returns Boolean indicating success
 */
export async function sendPhoneOtp(phone: string): Promise<boolean> {
  // This is a placeholder - Firebase Admin SDK doesn't directly support sending SMS
  // In a real implementation, you would use the Firebase client SDK on the mobile app
  // or use Twilio or another SMS provider
  console.log(`[Firebase] Would send OTP to ${phone} (placeholder)`);
  return true;
}

/**
 * Create a user with email and password
 * @param email User email
 * @param password User password
 * @param displayName User display name (optional)
 * @returns Created user record
 */
export async function createUserWithEmailPassword(
  email: string,
  password: string,
  displayName?: string
): Promise<admin.auth.UserRecord> {
  const admin = getFirebaseAdmin();
  
  // Create the user
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName,
  });
  
  console.log(`[Firebase] Created user with UID: ${userRecord.uid}`);
  return userRecord;
}

/**
 * Sign in with email and password (not possible with Admin SDK)
 * This is a placeholder - client-side authentication should be used instead
 * @param email User email
 * @param password User password
 * @returns Never resolves (throws error)
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<never> {
  throw new Error('signInWithEmailPassword is not available in Firebase Admin SDK. Use client-side SDK instead.');
}