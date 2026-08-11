import { FastifyInstance } from 'fastify';
import { sendOtp, verifyOtp } from '../lib/supabase';
import { hashPhone, hashPin } from '../lib/crypto';

/**
 * Send OTP to a phone number
 * @param app Fastify instance
 * @param phone Phone number in E.164 format
 * @returns Promise resolving to success boolean
 */
export async function sendOtpService(app: FastifyInstance, phone: string): Promise<boolean> {
  // Send OTP via Supabase
  const success = await sendOtp(phone);
  
  if (!success) {
    return false;
  }
  
  return true;
}

/**
 * Verify OTP and upsert user
 * @param app Fastify instance
 * @param phone Phone number in E.164 format
 * @param code OTP code
 * @returns Promise resolving to user object or null
 */
export async function verifyOtpService(app: FastifyInstance, phone: string, code: string): Promise<any | null> {
  // Verify OTP via Supabase
  const user = await verifyOtp(phone, code);
  
  if (!user) {
    return null;
  }
  
  // Hash phone for secure storage
  const phoneHash = hashPhone(phone);
  
  // Upsert user in database
  const dbUser = await app.db.user.upsert({
    where: {
      phoneHash: phoneHash
    },
    update: {
      phone: phone,
      phoneHash: phoneHash,
      updatedAt: new Date()
    },
    create: {
      phone: phone,
      phoneHash: phoneHash,
      displayName: null,
      defaultCurrency: 'USD',
      isTrustScorePublic: false,
      hasPinSet: false
    }
  });
  
  return dbUser;
}

/**
 * Set up PIN for a user
 * @param app Fastify instance
 * @param userId User ID
 * @param pin 4-digit PIN
 * @returns Promise resolving to success boolean
 */
export async function setupPinService(app: FastifyInstance, userId: string, pin: string): Promise<boolean> {
  // Hash the PIN
  const pinHash = await hashPin(pin);
  
  try {
    // Update user with PIN hash
    await app.db.user.update({
      where: {
        id: userId
      },
      data: {
        pinHash: pinHash,
        hasPinSet: true,
        pinAttempts: 0,
        pinLockedUntil: null,
        updatedAt: new Date()
      }
    });
    
    return true;
  } catch (error) {
    console.error('PIN setup error:', error);
    return false;
  }
}

/**
 * Verify user PIN
 * @param app Fastify instance
 * @param userId User ID
 * @param pin 4-digit PIN
 * @returns Promise resolving to success boolean
 */
export async function verifyPinService(app: FastifyInstance, userId: string, pin: string): Promise<boolean> {
  try {
    // Get user with PIN hash
    const user = await app.db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        pinHash: true,
        pinAttempts: true,
        pinLockedUntil: true
      }
    });
    
    if (!user) {
      return false;
    }
    
    // Check if PIN is locked
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      return false;
    }
    
    // Verify PIN
    const isValid = await hashPin(pin) === user.pinHash;
    
    // Update PIN attempts
    if (isValid) {
      // Reset attempts on success
      await app.db.user.update({
        where: {
          id: userId
        },
        data: {
          pinAttempts: 0,
          pinLockedUntil: null,
          updatedAt: new Date()
        }
      });
    } else {
      // Increment attempts on failure
      const newAttempts = user.pinAttempts + 1;
      const lockUntil = newAttempts >= 3 ? new Date(Date.now() + 30 * 60 * 1000) : null; // 30 min lock
      
      await app.db.user.update({
        where: {
          id: userId
        },
        data: {
          pinAttempts: newAttempts,
          pinLockedUntil: lockUntil,
          updatedAt: new Date()
        }
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('PIN verification error:', error);
    return false;
  }
}