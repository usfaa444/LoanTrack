import { z } from 'zod';

// Base schemas for route requests/responses
export const loanCreateSchema = z.object({
  lenderId: z.string().uuid(),
  borrowerId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  purpose: z.string().min(1).max(500),
  interestRate: z.number().min(0).default(0),
  collateralDescription: z.string().max(500).optional(),
  dueDate: z.string().datetime()
});

export const loanUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  purpose: z.string().min(1).max(500).optional(),
  interestRate: z.number().min(0).optional(),
  collateralDescription: z.string().max(500).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'OVERDUE', 'PAID', 'FORGIVEN', 'DISPUTED', 'CANCELLED']).optional()
});

export const paymentCreateSchema = z.object({
  loanId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum([
    'CASH',
    'BANK_TRANSFER',
    'VENMO',
    'PAYPAL',
    'CASHAPP',
    'CRYPTO',
    'OTHER'
  ]).default('OTHER'),
  note: z.string().max(500).optional(),
  purposeTag: z.string().max(200).optional(),
  paidAt: z.string().datetime().optional()
});

export const giftCreateSchema = z.object({
  loanId: z.string().uuid(),
  occasion: z.enum([
    'BIRTHDAY',
    'HOLIDAY',
    'ANNIVERSARY',
    'GRADUATION',
    'JUST_BECAUSE',
    'CUSTOM'
  ]),
  message: z.string().max(500).optional()
});