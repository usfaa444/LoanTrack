import { FastifyInstance } from 'fastify';
import { transitionLoanStatus } from './loan.service';

/**
 * Forgive a loan (convert to gift)
 * @param app Fastify instance
 * @param loanId Loan ID
 * @param lenderId Lender user ID
 * @param occasion Gift occasion
 * @param message Optional gift message
 * @returns Promise resolving to gift record
 */
export async function forgiveLoan(
  app: FastifyInstance,
  loanId: string,
  lenderId: string,
  occasion: string,
  message?: string
): Promise<any> {
  // Verify loan exists and user is lender
  const loan = await app.db.loan.findUnique({
    where: {
      id: loanId
    }
  });
  
  if (!loan) {
    throw new Error('Loan not found');
  }
  
  if (loan.lenderId !== lenderId) {
    throw new Error('Only lender can forgive a loan');
  }
  
  // Check if loan is in a valid state for forgiveness
  if (loan.status !== 'ACTIVE' && loan.status !== 'OVERDUE') {
    throw new Error('Can only forgive active or overdue loans');
  }
  
  // Start transaction
  const [gift, updatedLoan] = await app.db.$transaction([
    // Create gift record
    app.db.gift.create({
      data: {
        loanId: loanId,
        lenderId: lenderId,
        borrowerId: loan.borrowerId,
        amount: loan.amount,
        currency: loan.currency,
        occasion: occasion,
        message: message,
        forgivenAt: new Date(),
        createdAt: new Date()
      }
    }),
    
    // Update loan status to FORGIVEN
    app.db.loan.update({
      where: {
        id: loanId
      },
      data: {
        status: 'FORGIVEN',
        forgivenAt: new Date(),
        updatedAt: new Date()
      }
    })
  ]);
  
  return gift;
}