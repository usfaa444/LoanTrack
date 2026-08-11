import { PrismaClient } from '@prisma/client';

/**
 * Get dashboard statistics for a user
 * @param db Prisma client instance
 * @param userId User ID
 * @returns Promise resolving to dashboard data
 */
export async function getDashboardStats(db: PrismaClient, userId: string): Promise<any> {
  // Get count of active loans as lender
  const activeLoansAsLender = await db.loan.count({
    where: {
      lenderId: userId,
      status: 'ACTIVE',
      deletedAt: null
    }
  });
  
  // Get count of active loans as borrower
  const activeLoansAsBorrower = await db.loan.count({
    where: {
      borrowerId: userId,
      status: 'ACTIVE',
      deletedAt: null
    }
  });
  
  // Get count of overdue loans as lender
  const overdueLoansAsLender = await db.loan.count({
    where: {
      lenderId: userId,
      status: 'OVERDUE',
      deletedAt: null
    }
  });
  
  // Get count of overdue loans as borrower
  const overdueLoansAsBorrower = await db.loan.count({
    where: {
      borrowerId: userId,
      status: 'OVERDUE',
      deletedAt: null
    }
  });
  
  // Get count of paid loans as lender
  const paidLoansAsLender = await db.loan.count({
    where: {
      lenderId: userId,
      status: 'PAID',
      deletedAt: null
    }
  });
  
  // Get count of paid loans as borrower
  const paidLoansAsBorrower = await db.loan.count({
    where: {
      borrowerId: userId,
      status: 'PAID',
      deletedAt: null
    }
  });
  
  // Get total amount lent (active + paid + overdue)
  const totalLentResult = await db.loan.aggregate({
    where: {
      lenderId: userId,
      status: {
        in: ['ACTIVE', 'PAID', 'OVERDUE']
      },
      deletedAt: null
    },
    _sum: {
      amount: true
    }
  });
  
  const totalLent = totalLentResult._sum.amount || 0;
  
  // Get total amount borrowed (active + paid + overdue)
  const totalBorrowedResult = await db.loan.aggregate({
    where: {
      borrowerId: userId,
      status: {
        in: ['ACTIVE', 'PAID', 'OVERDUE']
      },
      deletedAt: null
    },
    _sum: {
      amount: true
    }
  });
  
  const totalBorrowed = totalBorrowedResult._sum.amount || 0;
  
  // Get total amount repaid to user
  const paymentsReceivedResult = await db.payment.aggregate({
    where: {
      loan: {
        lenderId: userId
      }
    },
    _sum: {
      amount: true
    }
  });
  
  const totalRepaidToUser = paymentsReceivedResult._sum.amount || 0;
  
  // Get total amount repaid by user
  const paymentsMadeResult = await db.payment.aggregate({
    where: {
      loan: {
        borrowerId: userId
      }
    },
    _sum: {
      amount: true
    }
  });
  
  const totalRepaidByUser = paymentsMadeResult._sum.amount || 0;
  
  return {
    activeLoansAsLender,
    activeLoansAsBorrower,
    overdueLoansAsLender,
    overdueLoansAsBorrower,
    paidLoansAsLender,
    paidLoansAsBorrower,
    totalLent: Number(totalLent),
    totalBorrowed: Number(totalBorrowed),
    totalRepaidToUser: Number(totalRepaidToUser),
    totalRepaidByUser: Number(totalRepaidByUser)
  };
}