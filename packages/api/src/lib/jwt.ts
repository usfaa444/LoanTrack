import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../config';

// Create a JWK set from the Supabase JWKS endpoint
const jwks = createRemoteJWKSet(new URL(`${config.supabaseUrl}/auth/v1/keys`));

/**
 * Verify a Supabase JWT token and extract claims
 * @param token JWT token string
 * @returns Promise resolving to payload or null if invalid
 */
export async function verifyJwt(token: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${config.supabaseUrl}/auth/v1`,
      audience: 'authenticated'
    });
    
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Extract user ID and phone from verified JWT payload
 * @param payload Verified JWT payload
 * @returns Object with userId and phone or null if missing
 */
export function extractUserClaims(payload: any): { userId: string; phone: string } | null {
  if (!payload || !payload.sub || !payload.phone) {
    return null;
  }
  
  return {
    userId: payload.sub,
    phone: payload.phone
  };
}