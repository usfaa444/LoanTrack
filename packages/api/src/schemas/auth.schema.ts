import { z } from 'zod';

// OTP Send Schema
export const otpSendSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Must be E.164 format.')
});

// OTP Verify Schema
export const otpVerifySchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Must be E.164 format.'),
  code: z.string().length(6, 'OTP code must be 6 digits.')
});

// PIN Setup Schema
export const pinSetupSchema = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits.')
});

// PIN Verify Schema
export const pinVerifySchema = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits.')
});

// Export types
export type OtpSendRequest = z.infer<typeof otpSendSchema>;
export type OtpVerifyRequest = z.infer<typeof otpVerifySchema>;
export type PinSetupRequest = z.infer<typeof pinSetupSchema>;
export type PinVerifyRequest = z.infer<typeof pinVerifySchema>;