import { PrismaClient } from '@prisma/client';
import { hashPhone, hashPin, verifyPin } from '../lib/crypto';
import { createHash } from 'crypto';

function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

export async function upsertUserByPhone(
  db: PrismaClient, phone: string, displayName?: string
) {
  const phoneHash = hashPhone(phone);
  return db.user.upsert({
    where: { phoneHash },
    update: { displayName, updatedAt: new Date() },
    create: { phone, phoneHash, displayName, defaultCurrency: 'XOF', hasPinSet: false, isTrustScorePublic: false },
  });
}

export async function upsertUserByEmail(
  db: PrismaClient, email: string, displayName?: string
) {
  const emailHash = hashEmail(email);
  return db.user.upsert({
    where: { emailHash },
    update: { displayName, updatedAt: new Date() },
    create: { email, emailHash, phone: '', phoneHash: '', displayName, defaultCurrency: 'XOF', hasPinSet: false, isTrustScorePublic: false },
  });
}

export async function setupPin(db: PrismaClient, userId: string, pin: string): Promise<boolean> {
  try {
    const pinHash = await hashPin(pin);
    await db.user.update({ where: { id: userId }, data: { pinHash, hasPinSet: true } });
    return true;
  } catch { return false; }
}

export async function verifyPinService(db: PrismaClient, userId: string, pin: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { pinHash: true, pinAttempts: true, pinLockedUntil: true } });
    if (!user?.pinHash) return false;
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) return false;
    const valid = await verifyPin(pin, user.pinHash);
    if (valid) {
      await db.user.update({ where: { id: userId }, data: { pinAttempts: 0, pinLockedUntil: null } });
    } else {
      const attempts = (user.pinAttempts || 0) + 1;
      await db.user.update({
        where: { id: userId },
        data: { pinAttempts: attempts, pinLockedUntil: attempts >= 3 ? new Date(Date.now() + 30 * 60 * 1000) : null },
      });
    }
    return valid;
  } catch { return false; }
}

export async function getUserByPhone(db: PrismaClient, phone: string) {
  return db.user.findUnique({ where: { phoneHash: hashPhone(phone) } });
}

export async function getUserByEmail(db: PrismaClient, email: string) {
  return db.user.findUnique({ where: { emailHash: hashEmail(email) } });
}