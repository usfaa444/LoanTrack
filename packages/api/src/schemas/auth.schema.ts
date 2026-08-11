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

export type OtpSendRequest = z.infer<typeof otpSendSchema>;
export type OtpVerifyRequest = z.infer<typeof otpVerifySchema>;
export type PinSetupRequest = z.infer<typeof pinSetupSchema>;
export type PinVerifyRequest = z.infer<typeof pinVerifySchema>;