import { z } from 'zod';

// Loan Status Enum
export const loanStatusSchema = z.enum(['ACTIVE', 'OVERDUE', 'PAID', 'FORGIVEN', 'DISPUTED', 'CANCELLED']);

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

// Loan Schema
export const loanSchema = z.object({
  id: z.string().uuid().optional(),
  lenderId: z.string().uuid(),
  borrowerId: z.string().uuid(),
  amount: z.number().positive(),
  remainingBalance: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  purpose: z.string().min(1).max(500),
  interestRate: z.number().min(0).default(0),
  collateralDescription: z.string().max(500).optional(),
  status: loanStatusSchema.default('ACTIVE'),
  escalationStage: z.number().int().min(0).max(4).default(0),
  dueDate: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  borrowerAcceptedAt: z.string().datetime().optional(),
  paidAt: z.string().datetime().optional(),
  forgivenAt: z.string().datetime().optional(),
  disputedAt: z.string().datetime().optional(),
  disputedBy: z.string().uuid().optional(),
  cancelledAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional()
});

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
export type Loan = z.infer<typeof loanSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type LoanStatus = z.infer<typeof loanStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;