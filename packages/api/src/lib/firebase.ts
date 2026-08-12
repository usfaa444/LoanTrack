import admin from 'firebase-admin';
import { config } from '../config';

let firebaseAdmin: admin.app.App | null = null;

function getAdmin(): admin.app.App {
  if (!firebaseAdmin) {
    if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
      throw new Error('Firebase not configured');
    }
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebaseProjectId,
        clientEmail: config.firebaseClientEmail,
        privateKey: config.firebasePrivateKey?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[Firebase] Admin SDK initialized');
  }
  return firebaseAdmin;
}

export async function verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
  return getAdmin().auth().verifyIdToken(token);
}

export async function createUser(email: string, password: string, displayName?: string) {
  return getAdmin().auth().createUser({ email, password, displayName });
}

/** Sign in with email/password via Firebase REST API (no client SDK needed) */
export async function signInWithEmail(email: string, password: string): Promise<{ idToken: string; localId: string } | null> {
  try {
    const apiKey = process.env.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '';
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await res.json();
    if (data.error) {
      console.error('[Firebase] Sign in error:', data.error.message);
      return null;
    }
    return { idToken: data.idToken, localId: data.localId };
  } catch (e: any) {
    console.error('[Firebase] Sign in exception:', e.message);
    return null;
  }
}