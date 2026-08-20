import { PrismaClient } from '@prisma/client';
import { Payment } from '../schemas/payment.schema';
import { transitionLoanStatus } from './loan.service';

/**
 * Record a payment for a loan
 * @param db Prisma client instance
 * @param payment Payment data
 * @param userId User ID of recorder
 * @returns Promise resolving to created payment
 */
export async function recordPayment(db: PrismaClient, payment: Omit<Payment, 'id' | 'createdAt'>, userId: string): Promise<any> {
  // Verify user has access to this loan
  const loan = await db.loan.findUnique({
    where: {
      id: payment.loanId
    }
  });
  
  if (!loan) {
    throw new Error('Loan not found');
  }
  
  if (loan.lenderId !== userId && loan.borrowerId !== userId) {
    throw new Error('User does not have access to this loan');
  }
  
  // Check if loan is in a valid state for payments
  if (loan.status !== 'ACTIVE' && loan.status !== 'OVERDUE') {
    throw new Error('Cannot record payment for loan in current status');
  }
  
  // Create payment in database
  const createdPayment = await db.payment.create({
    data: {
      ...payment,
      paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
      createdAt: new Date(),
      recordedById: userId
    }
  });
  
  // Update loan remaining balance
  const newBalance = loan.remainingBalance - payment.amount;
  
  // Prepare loan update data
  const loanUpdateData: any = {
    remainingBalance: newBalance,
    updatedAt: new Date()
  };
  
  // If balance is zero or negative, transition to PAID
  if (newBalance <= 0) {
    loanUpdateData.status = 'PAID';
    loanUpdateData.paidAt = new Date();
  } else if (loan.status === 'OVERDUE' && newBalance > 0) {
    // If partially paid overdue loan, keep it as OVERDUE
    loanUpdateData.status = 'OVERDUE';
  } else if (loan.status === 'ACTIVE' && newBalance > 0) {
    // Keep ACTIVE status for partial payments
    loanUpdateData.status = 'ACTIVE';
  }
  
  // Update loan
  await db.loan.update({
    where: {
      id: payment.loanId
    },
    data: loanUpdateData
  });
  
  return createdPayment;
}

/**
 * Record a payment for a loan with auto-balance feature
 * Automatically adjusts the payment amount if it would overpay the loan
 * @param db Prisma client instance
 * @param payment Payment data
 * @param userId User ID of recorder
 * @param autoBalance Whether to automatically adjust payment amount to prevent overpayment
 * @returns Promise resolving to created payment
 */
export async function recordPaymentWithAutoBalance(
  db: PrismaClient, 
  payment: Omit<Payment, 'id' | 'createdAt'>, 
  userId: string, 
  autoBalance: boolean = false
): Promise<any> {
  // Verify user has access to this loan
  const loan = await db.loan.findUnique({
    where: {
      id: payment.loanId
    }
  });
  
  if (!loan) {
    throw new Error('Loan not found');
  }
  
  if (loan.lenderId !== userId && loan.borrowerId !== userId) {
    throw new Error('User does not have access to this loan');
  }
  
  // Check if loan is in a valid state for payments
  if (loan.status !== 'ACTIVE' && loan.status !== 'OVERDUE') {
    throw new Error('Cannot record payment for loan in current status');
  }
  
  // Auto-balance logic: adjust payment amount if it would overpay
  let adjustedAmount = payment.amount;
  if (autoBalance && payment.amount > loan.remainingBalance) {
    adjustedAmount = loan.remainingBalance;
  }
  
  // Create payment in database with adjusted amount
  const createdPayment = await db.payment.create({
    data: {
      ...payment,
      amount: adjustedAmount,
      paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
      createdAt: new Date(),
      recordedById: userId
    }
  });
  
  // Update loan remaining balance
  const newBalance = loan.remainingBalance - adjustedAmount;
  
  // Prepare loan update data
  const loanUpdateData: any = {
    remainingBalance: newBalance,
    updatedAt: new Date()
  };
  
  // If balance is zero or negative, transition to PAID
  if (newBalance <= 0) {
    loanUpdateData.status = 'PAID';
    loanUpdateData.paidAt = new Date();
  } else if (loan.status === 'OVERDUE' && newBalance > 0) {
    // If partially paid overdue loan, keep it as OVERDUE
    loanUpdateData.status = 'OVERDUE';
  } else if (loan.status === 'ACTIVE' && newBalance > 0) {
    // Keep ACTIVE status for partial payments
    loanUpdateData.status = 'ACTIVE';
  }
  
  // Update loan
  await db.loan.update({
    where: {
      id: payment.loanId
    },
    data: loanUpdateData
  });
  
  return createdPayment;
}

/**
 * List payments for a loan
 * @param db Prisma client instance
 * @param loanId Loan ID
 * @param userId User ID
 * @returns Promise resolving to array of payments
 */
export async function listPayments(db: PrismaClient, loanId: string, userId: string): Promise<any[]> {
  // Verify user has access to this loan
  const loan = await db.loan.findUnique({
    where: {
      id: loanId
    }
  });
  
  if (!loan) {
    throw new Error('Loan not found');
  }
  
  if (loan.lenderId !== userId && loan.borrowerId !== userId) {
    throw new Error('User does not have access to this loan');
  }
  
  // Get payments for loan
  const payments = await db.payment.findMany({
    where: {
      loanId: loanId
    },
    orderBy: {
      paidAt: 'desc'
    }
  });
  
  return payments;
}