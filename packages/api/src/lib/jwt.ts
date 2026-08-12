import { jwtVerify, createSecretKey } from 'jose';
import { config } from '../config';

export async function verifyJwt(token: string): Promise<any | null> {
  try {
    // Use local JWT verification with HS256
    const secretKey = createSecretKey(Buffer.from(config.jwtSecret, 'utf-8'));
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('JWT verification error:', (error as any)?.message);
    return null;
  }
}

export function extractUserClaims(payload: any): { userId: string } | null {
  if (!payload || !payload.id) return null;
  return { userId: payload.id };
}