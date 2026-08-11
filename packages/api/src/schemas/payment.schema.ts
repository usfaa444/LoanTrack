import { z } from 'zod';

// Payment Method Enum
export const paymentMethodSchema = z.enum([
  'CASH',
  'BANK_TRANSFER',
  'VENMO',
  'PAYPAL',
  'CASHAPP',
  'CRYPTO',
  'OTHER'
]);

// Payment Schema
export const paymentSchema = z.object({
  id: z.string().uuid().optional(),
  loanId: z.string().uuid(),
  amount: z.number().positive(),
  method: paymentMethodSchema.default('OTHER'),
  note: z.string().max(500).optional(),
  purposeTag: z.string().max(200).optional(),
  paidAt: z.string().datetime().optional(),
  recordedById: z.string().uuid(),
  createdAt: z.string().datetime().optional()
});

// Export types
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;