import { PrismaClient } from '@prisma/client';
import { Loan, LoanStatus } from '../schemas/loan.schema';

/**
 * Create a new loan
 * @param db Prisma client instance
 * @param loan Loan data
 * @param userId User ID of creator
 * @returns Promise resolving to created loan
 */
export async function createLoan(db: PrismaClient, loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<any> {
  // Verify user owns this loan (either lender or borrower)
  if (userId !== loan.lenderId && userId !== loan.borrowerId) {
    throw new Error('User must be either lender or borrower');
  }
  
  // Create loan in database
  const createdLoan = await db.loan.create({
    data: {
      ...loan,
      remainingBalance: loan.amount, // Initially, balance equals amount
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  return createdLoan;
}

/**
 * Get loan by ID with ownership check
 * @param db Prisma client instance
 * @param loanId Loan ID
 * @param userId User ID
 * @returns Promise resolving to loan or null
 */
export async function getLoan(db: PrismaClient, loanId: string, userId: string): Promise<any | null> {
  const loan = await db.loan.findUnique({
    where: {
      id: loanId
    }
  });
  
  if (!loan) {
    return null;
  }
  
  // Check ownership
  if (loan.lenderId !== userId && loan.borrowerId !== userId) {
    throw new Error('User does not have access to this loan');
  }
  
  return loan;
}

/**
 * Update loan with ownership check
 * @param db Prisma client instance
 * @param loanId Loan ID
 * @param updates Loan updates
 * @param userId User ID
 * @returns Promise resolving to updated loan
 */
export async function updateLoan(db: PrismaClient, loanId: string, updates: Partial<Loan>, userId: string): Promise<any> {
  // Verify ownership
  const loan = await getLoan(db, loanId, userId);
  if (!loan) {
    throw new Error('Loan not found or access denied');
  }
  
  // Update loan in database
  const updatedLoan = await db.loan.update({
    where: {
      id: loanId
    },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
  
  return updatedLoan;
}

/**
 * Delete loan with ownership check (soft delete)
 * @param db Prisma client instance
 * @param loanId Loan ID
 * @param userId User ID
 * @returns Promise resolving to success boolean
 */
export async function deleteLoan(db: PrismaClient, loanId: string, userId: string): Promise<boolean> {
  // Verify ownership
  const loan = await getLoan(db, loanId, userId);
  if (!loan) {
    throw new Error('Loan not found or access denied');
  }
  
  // Soft delete loan
  await db.loan.update({
    where: {
      id: loanId
    },
    data: {
      deletedAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  return true;
}

/**
 * List loans for user with filters
 * @param db Prisma client instance
 * @param userId User ID
 * @param filters Optional filters
 * @returns Promise resolving to array of loans
 */
export async function listLoans(db: PrismaClient, userId: string, filters?: {
  status?: LoanStatus;
  asLender?: boolean;
  asBorrower?: boolean;
}): Promise<any[]> {
  const where: any = {
    deletedAt: null,
    OR: [
      { lenderId: userId },
      { borrowerId: userId }
    ]
  };
  
  // Apply status filter
  if (filters?.status) {
    where.status = filters.status;
  }
  
  // Apply role filter
  if (filters?.asLender) {
    where.lenderId = userId;
    delete where.OR;
  }
  
  if (filters?.asBorrower) {
    where.borrowerId = userId;
    delete where.OR;
  }
  
  const loans = await db.loan.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return loans;
}

/**
 * Transition loan to a new status
 * @param db Prisma client instance
 * @param loanId Loan ID
 * @param newStatus New status
 * @param userId User ID
 * @returns Promise resolving to updated loan
 */
export async function transitionLoanStatus(
  db: PrismaClient,
  loanId: string,
  newStatus: LoanStatus,
  userId: string
): Promise<any> {
  // Verify ownership
  const loan = await getLoan(db, loanId, userId);
  if (!loan) {
    throw new Error('Loan not found or access denied');
  }
  
  // Prepare update data
  const updateData: any = {
    status: newStatus,
    updatedAt: new Date()
  };
  
  // Add timestamp for specific statuses
  const timestampFields: Record<LoanStatus, string> = {
    ACTIVE: '',
    OVERDUE: '',
    PAID: 'paidAt',
    FORGIVEN: 'forgivenAt',
    DISPUTED: 'disputedAt',
    CANCELLED: 'cancelledAt'
  };
  
  const timestampField = timestampFields[newStatus];
  if (timestampField) {
    updateData[timestampField] = new Date();
  }
  
  // Update loan status
  const updatedLoan = await db.loan.update({
    where: {
      id: loanId
    },
    data: updateData
  });
  
  return updatedLoan;
}