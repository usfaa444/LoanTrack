import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient instance or use the existing one
const client = globalThis.prisma || new PrismaClient();

// In development, we want to reuse the client across hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = client;
}

export * from '@prisma/client';
export default client;