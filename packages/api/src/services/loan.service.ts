import { FastifyInstance } from 'fastify';
import { Loan, LoanStatus } from '../schemas/loan.schema';

/**
 * Create a new loan
 * @param app Fastify instance
 * @param loan Loan data
 * @param userId User ID of creator
 * @returns Promise resolving to created loan
 */
export async function createLoan(app: FastifyInstance, loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<any> {
  // Verify user owns this loan (either lender or borrower)
  if (userId !== loan.lenderId && userId !== loan.borrowerId) {
    throw new Error('User must be either lender or borrower');
  }
  
  // Create loan in database
  const createdLoan = await app.db.loan.create({
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
 * @param app Fastify instance
 * @param loanId Loan ID
 * @param userId User ID
 * @returns Promise resolving to loan or null
 */
export async function getLoan(app: FastifyInstance, loanId: string, userId: string): Promise<any | null> {
  const loan = await app.db.loan.findUnique({
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
 * @param app Fastify instance
 * @param loanId Loan ID
 * @param updates Loan updates
 * @param userId User ID
 * @returns Promise resolving to updated loan
 */
export async function updateLoan(app: FastifyInstance, loanId: string, updates: Partial<Loan>, userId: string): Promise<any> {
  // Verify ownership
  const loan = await getLoan(app, loanId, userId);
  if (!loan) {
    throw new Error('Loan not found or access denied');
  }
  
  // Update loan in database
  const updatedLoan = await app.db.loan.update({
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
 * @param app Fastify instance
 * @param loanId Loan ID
 * @param userId User ID
 * @returns Promise resolving to success boolean
 */
export async function deleteLoan(app: FastifyInstance, loanId: string, userId: string): Promise<boolean> {
  // Verify ownership
  const loan = await getLoan(app, loanId, userId);
  if (!loan) {
    throw new Error('Loan not found or access denied');
  }
  
  // Soft delete loan
  await app.db.loan.update({
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
 * @param app Fastify instance
 * @param userId User ID
 * @param filters Optional filters
 * @returns Promise resolving to array of loans
 */
export async function listLoans(app: FastifyInstance, userId: string, filters?: {
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
  
  const loans = await app.db.loan.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return loans;
}

/**
 * Transition loan to a new status
 * @param app Fastify instance
 * @param loanId Loan ID
 * @param newStatus New status
 * @param userId User ID
 * @returns Promise resolving to updated loan
 */
export async function transitionLoanStatus(
  app: FastifyInstance,
  loanId: string,
  newStatus: LoanStatus,
  userId: string
): Promise<any> {
  // Verify ownership
  const loan = await getLoan(app, loanId, userId);
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
  const updatedLoan = await app.db.loan.update({
    where: {
      id: loanId
    },
    data: updateData
  });
  
  return updatedLoan;
}