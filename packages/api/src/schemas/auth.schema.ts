import { z } from 'zod';

export const otpSendSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid E.164 phone'),
});

export const otpVerifySchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid E.164 phone'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export const pinSetupSchema = z.object({
  pin: z.string().min(4).max(6, 'PIN must be 4-6 digits'),
});

export const pinVerifySchema = z.object({
  pin: z.string().min(4).max(6, 'PIN must be 4-6 digits'),
});

// New schemas for Firebase authentication
export const emailRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required'),
});

export const firebaseTokenSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

// JSON Schema versions for Fastify route validation
export const otpSendJsonSchema = {
  type: 'object' as const,
  required: ['phone'],
  properties: {
    phone: { type: 'string' },
  },
};

export const otpVerifyJsonSchema = {
  type: 'object' as const,
  required: ['phone', 'code'],
  properties: {
    phone: { type: 'string' },
    code: { type: 'string', minLength: 6, maxLength: 6 },
  },
};

export const pinSetupJsonSchema = {
  type: 'object' as const,
  required: ['pin'],
  properties: {
    pin: { type: 'string', minLength: 4, maxLength: 6 },
  },
};

export const pinVerifyJsonSchema = {
  type: 'object' as const,
  required: ['pin'],
  properties: {
    pin: { type: 'string', minLength: 4, maxLength: 6 },
  },
};

// New JSON schemas for Firebase authentication
export const emailRegisterJsonSchema = {
  type: 'object' as const,
  required: ['email', 'password', 'displayName'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    displayName: { type: 'string', minLength: 1 },
  },
};

export const firebaseTokenJsonSchema = {
  type: 'object' as const,
  required: ['idToken'],
  properties: {
    idToken: { type: 'string', minLength: 1 },
  },
};

export const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const emailLoginJsonSchema = {
  type: 'object' as const,
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
};

export type EmailLoginRequest = z.infer<typeof emailLoginSchema>;

export type OtpSendRequest = z.infer<typeof otpSendSchema>;
export type OtpVerifyRequest = z.infer<typeof otpVerifySchema>;
export type PinSetupRequest = z.infer<typeof pinSetupSchema>;
export type PinVerifyRequest = z.infer<typeof pinVerifySchema>;
export type EmailRegisterRequest = z.infer<typeof emailRegisterSchema>;
export type FirebaseTokenRequest = z.infer<typeof firebaseTokenSchema>;