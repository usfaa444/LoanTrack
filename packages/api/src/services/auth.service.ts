import { PrismaClient } from '@prisma/client';
import { hashPhone, hashPin, verifyPin } from '../lib/crypto';
import { verifyIdToken } from '../lib/firebase';

export async function registerOrUpsertUser(
  db: PrismaClient,
  uid: string,
  phone: string,
  displayName?: string,
) {
  const phoneHash = hashPhone(phone);
  return db.user.upsert({
    where: { phoneHash },
    update: {
      phoneHash,
      displayName: displayName || undefined,
      updatedAt: new Date(),
    },
    create: {
      phone,
      phoneHash,
      displayName,
      defaultCurrency: 'XOF',
      isTrustScorePublic: false,
      hasPinSet: false,
    },
  });
}

export async function verifyFirebaseAndUpsert(
  db: PrismaClient,
  idToken: string
) {
  const decoded = await verifyIdToken(idToken);
  if (!decoded) return null;
  const phone = (decoded as any).phone || (decoded as any).phone_number || '';
  const uid = (decoded as any).uid || (decoded as any).sub || '';
  if (!phone || !uid) return null;
  return registerOrUpsertUser(db, uid, phone, (decoded as any).name || (decoded as any).display_name);
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