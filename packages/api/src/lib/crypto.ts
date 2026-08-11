import * as crypto from 'crypto';
import { config } from '../config';
import bcrypt from 'bcryptjs';

// Pepper for phone hashing (should be stored securely in production)
const PHONE_HASH_PEPPER = 'loantrack-phone-pepper-change-in-production';

/**
 * Hash a phone number with SHA-256 and pepper for secure storage
 * @param phone Phone number to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashPhone(phone: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(phone + PHONE_HASH_PEPPER);
  return hash.digest('hex');
}

/**
 * Encrypt a phone number using AES-256-GCM
 * @param phone Phone number to encrypt
 * @returns Base64 encoded encrypted phone
 */
export function encryptPhone(phone: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(config.encryptionKey, 'utf-8');
  
  // Generate a random IV
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(iv); // Use IV as AAD
  
  let encrypted = cipher.update(phone, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get the auth tag
  const authTag = cipher.getAuthTag();
  
  // Combine IV, auth tag and encrypted data
  const result = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64')
  ]);
  
  return result.toString('base64');
}

/**
 * Decrypt a phone number using AES-256-GCM
 * @param encryptedPhone Base64 encoded encrypted phone
 * @returns Decrypted phone number or null if decryption fails
 */
export function decryptPhone(encryptedPhone: string): string | null {
  try {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(config.encryptionKey, 'utf-8');
    
    // Decode the combined data
    const data = Buffer.from(encryptedPhone, 'base64');
    
    // Extract components
    const iv = data.subarray(0, 16);
    const authTag = data.subarray(16, 32);
    const encrypted = data.subarray(32);
    
    // Create decipher
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(iv); // Use IV as AAD
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Phone decryption error:', error);
    return null;
  }
}

/**
 * Hash a PIN using bcrypt with cost factor 12
 * @param pin PIN to hash
 * @returns Promise resolving to hashed PIN
 */
export async function hashPin(pin: string): Promise<string> {
  return await bcrypt.hash(pin, 12);
}

/**
 * Verify a PIN against its hash
 * @param pin PIN to verify
 * @param hash Hashed PIN
 * @returns Promise resolving to boolean indicating match
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(pin, hash);
}