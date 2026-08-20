import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { TrustScoreTier, TrustScoreEventType } from '@prisma/client';

// Extend FastifyInstance type to include db property
declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient;
  }
}

/**
 * Calculate trust score for a user using a credit-bureau-inspired model
 * @param app Fastify instance
 * @param userId User ID
 * @returns Promise resolving to trust score data
 */
export async function calculateTrustScore(app: FastifyInstance, userId: string): Promise<any> {
  // Get user's loans for repayment analysis
  const loansAsBorrower = await app.db.loan.findMany({
    where: {
      borrowerId: userId,
      deletedAt: null
    },
    include: {
      payments: true
    }
  });

  // Get user's loans as lender for credit mix calculation
  const loansAsLender = await app.db.loan.findMany({
    where: {
      lenderId: userId,
      deletedAt: null
    }
  });

  // Combine all loans for analysis
  const allLoans = [...loansAsBorrower, ...loansAsLender];

  // 1. PAYMENT HISTORY (35% of score, 0-350 points)
  let onTimeCount = 0;
  let lateCount = 0;
  let defaultCount = 0;
  let totalPaymentObligations = 0;
  let recentDefault = false;

  // Calculate payment history metrics
  for (const loan of loansAsBorrower) {
    totalPaymentObligations++;
    
    // Check loan status for payment history
    if (loan.status === 'PAID') {
      onTimeCount++;
    } else if (loan.status === 'OVERDUE') {
      lateCount++;
      // Check if default was recent (within last 30 days)
      if (loan.dueDate && new Date(loan.dueDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        recentDefault = true;
      }
    } else if (loan.status === 'DISPUTED') {
      defaultCount++;
      // Check if default was recent (within last 30 days)
      if (loan.disputedAt && new Date(loan.disputedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        recentDefault = true;
      }
    }
  }

  // Calculate recency multiplier
  let recencyMultiplier = 1.0;
  if (recentDefault) {
    recencyMultiplier = 0.5;
  } else {
    // Check for defaults in last 90 days
    for (const loan of loansAsBorrower) {
      if ((loan.status === 'OVERDUE' || loan.status === 'DISPUTED') && 
          ((loan.dueDate && new Date(loan.dueDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
           (loan.disputedAt && new Date(loan.disputedAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)))) {
        recencyMultiplier = 0.7;
        break;
      }
    }
    
    // If still 1.0, check for defaults in last 180 days
    if (recencyMultiplier === 1.0) {
      for (const loan of loansAsBorrower) {
        if ((loan.status === 'OVERDUE' || loan.status === 'DISPUTED') && 
            ((loan.dueDate && new Date(loan.dueDate) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)) ||
             (loan.disputedAt && new Date(loan.disputedAt) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)))) {
          recencyMultiplier = 0.85;
          break;
        }
      }
    }
  }

  // Calculate payment history score
  const paymentHistoryScore = totalPaymentObligations > 0 
    ? 350 * (onTimeCount / totalPaymentObligations) * recencyMultiplier 
    : 350; // Full score if no payment history

  // 2. DEBT UTILIZATION (30% of score, 0-300 points)
  let totalRemainingBalance = 0;
  let totalOriginalAmount = 0;
  let activeLoanCount = 0;

  // Calculate debt utilization metrics
  for (const loan of loansAsBorrower) {
    if (loan.status === 'ACTIVE' || loan.status === 'OVERDUE') {
      activeLoanCount++;
      totalRemainingBalance += Number(loan.remainingBalance);
      totalOriginalAmount += Number(loan.amount);
    }
  }

  // Calculate average utilization
  let avgUtilization = 0;
  if (activeLoanCount > 0 && totalOriginalAmount > 0) {
    avgUtilization = totalRemainingBalance / totalOriginalAmount;
  }

  // Calculate debt utilization score
  const debtUtilizationScore = activeLoanCount > 0 
    ? Math.max(0, Math.min(300, 300 * (1 - avgUtilization)))
    : 300; // Full score if no active loans

  // 3. CREDIT HISTORY LENGTH (15% of score, 0-150 points)
  let monthsSinceFirstLoan = 0;
  if (allLoans.length > 0) {
    // Find the earliest loan
    const firstLoan = allLoans.reduce((earliest, loan) => {
      return new Date(loan.createdAt) < new Date(earliest.createdAt) ? loan : earliest;
    }, allLoans[0]);
    
    // Calculate months since first loan
    const firstLoanDate = new Date(firstLoan.createdAt);
    const currentDate = new Date();
    monthsSinceFirstLoan = (currentDate.getFullYear() - firstLoanDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - firstLoanDate.getMonth());
  }

  // Calculate credit history score
  const creditHistoryScore = Math.max(0, Math.min(150, 150 * Math.min(monthsSinceFirstLoan / 24, 1)));

  // 4. NEW CREDIT (10% of score, 0-100 points)
  let recentLoanCount = 0;
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  // Count loans created in last 60 days
  for (const loan of allLoans) {
    if (new Date(loan.createdAt) > sixtyDaysAgo) {
      recentLoanCount++;
    }
  }

  // Calculate new credit score
  const newCreditScore = Math.max(0, Math.min(100, 100 - (recentLoanCount * 10)));

  // 5. CREDIT MIX (10% of score, 0-100 points)
  // Count unique counterparties (lenders + borrowers)
  const uniqueCounterparties = new Set([
    ...loansAsBorrower.map(loan => loan.lenderId),
    ...loansAsLender.map(loan => loan.borrowerId)
  ]).size;

  // Count unique purpose codes
  const uniquePurposes = new Set(allLoans.map(loan => loan['purposeCode']).filter(code => code !== null && code !== undefined)).size;

  // Calculate credit mix score
  const creditMixScore = Math.max(0, Math.min(100, 
    100 * Math.min(uniqueCounterparties / 5, 1.0) * 0.5 + 
    100 * Math.min(uniquePurposes / 3, 1.0) * 0.5
  ));

  // Calculate total score
  let score = Math.round(
    paymentHistoryScore + 
    debtUtilizationScore + 
    creditHistoryScore + 
    newCreditScore + 
    creditMixScore
  );

  // Clamp score between 300-850 (like FICO)
  score = Math.max(300, Math.min(850, score));

  // Determine tier based on score
  let tier = 'Poor'; // Default tier
  if (score >= 800) {
    tier = 'Exceptional';
  } else if (score >= 740) {
    tier = 'Very Good';
  } else if (score >= 670) {
    tier = 'Good';
  } else if (score >= 580) {
    tier = 'Fair';
  } else {
    tier = 'Poor';
  }

  // Return detailed scoring information
  return {
    score,
    tier,
    factors: {
      paymentHistory: { 
        score: Math.round(paymentHistoryScore), 
        maxScore: 350, 
        onTimeCount, 
        lateCount, 
        defaultCount, 
        recencyMultiplier 
      },
      debtUtilization: { 
        score: Math.round(debtUtilizationScore), 
        maxScore: 300, 
        avgUtilization: parseFloat(avgUtilization.toFixed(2)), 
        activeLoanCount 
      },
      creditHistory: { 
        score: Math.round(creditHistoryScore), 
        maxScore: 150, 
        monthsSinceFirstLoan, 
        totalLoansEver: allLoans.length 
      },
      newCredit: { 
        score: Math.round(newCreditScore), 
        maxScore: 100, 
        recentLoanCount 
      },
      creditMix: { 
        score: Math.round(creditMixScore), 
        maxScore: 100, 
        uniqueCounterparties, 
        uniquePurposes 
      }
    }
  };
}

/**
 * Get or create trust score for user
 * @param app Fastify instance
 * @param userId User ID
 * @returns Promise resolving to trust score record
 */
export async function getOrCreateTrustScore(app: FastifyInstance, userId: string): Promise<any> {
  // Try to get existing trust score
  let trustScore = await app.db.trustScore.findUnique({
    where: {
      userId: userId
    }
  });
  
  // If not found, calculate and create
  if (!trustScore) {
    const calculatedScore = await calculateTrustScore(app, userId);
    
    // Map the new score structure to the existing database model
    const tierMap: Record<string, TrustScoreTier> = {
      'Exceptional': TrustScoreTier.EXEMPLARY,
      'Very Good': TrustScoreTier.TRUSTED,
      'Good': TrustScoreTier.RELIABLE,
      'Fair': TrustScoreTier.BUILDING,
      'Poor': TrustScoreTier.UNTRUSTED
    };
    
    trustScore = await app.db.trustScore.create({
      data: {
        userId: userId,
        score: calculatedScore.score,
        tier: tierMap[calculatedScore.tier] || TrustScoreTier.BUILDING,
        baseScore: 300, // Base score for the new model
        repaymentBonus: calculatedScore.factors?.paymentHistory?.score || 0,
        defaultPenalty: 0, // Not directly used in new model
        tenureBonus: calculatedScore.factors?.creditHistory?.score || 0,
        volumeBonus: calculatedScore.factors?.debtUtilization?.score || 0
      }
    });
  }
  
  return trustScore;
}

/**
 * Update trust score based on event
 * @param app Fastify instance
 * @param userId User ID
 * @param eventType Type of event affecting trust score
 * @param loanId Associated loan ID (optional)
 * @returns Promise resolving to updated trust score
 */
export async function updateTrustScore(
  app: FastifyInstance,
  userId: string,
  eventType: TrustScoreEventType,
  loanId?: string
): Promise<any> {
  // Recalculate trust score
  const calculatedScore = await calculateTrustScore(app, userId);
  
  // Map the new score structure to the existing database model
  const tierMap: Record<string, TrustScoreTier> = {
    'Exceptional': TrustScoreTier.EXEMPLARY,
    'Very Good': TrustScoreTier.TRUSTED,
    'Good': TrustScoreTier.RELIABLE,
    'Fair': TrustScoreTier.BUILDING,
    'Poor': TrustScoreTier.UNTRUSTED
  };
  
  // Update or create trust score record
  const trustScore = await app.db.trustScore.upsert({
    where: {
      userId: userId
    },
    update: {
      score: calculatedScore.score,
      tier: tierMap[calculatedScore.tier] || TrustScoreTier.BUILDING,
      baseScore: 300, // Base score for the new model
      repaymentBonus: calculatedScore.factors?.paymentHistory?.score || 0,
      defaultPenalty: 0, // Not directly used in new model
      tenureBonus: calculatedScore.factors?.creditHistory?.score || 0,
      volumeBonus: calculatedScore.factors?.debtUtilization?.score || 0,
      updatedAt: new Date()
    },
    create: {
      userId: userId,
      score: calculatedScore.score,
      tier: tierMap[calculatedScore.tier] || TrustScoreTier.BUILDING,
      baseScore: 300, // Base score for the new model
      repaymentBonus: calculatedScore.factors?.paymentHistory?.score || 0,
      defaultPenalty: 0, // Not directly used in new model
      tenureBonus: calculatedScore.factors?.creditHistory?.score || 0,
      volumeBonus: calculatedScore.factors?.debtUtilization?.score || 0
    }
  });
  
  // Log the event
  await app.db.trustScoreEvent.create({
    data: {
      userId: userId,
      type: eventType,
      delta: 0, // We would calculate the actual delta in a more sophisticated implementation
      newScore: calculatedScore.score,
      associatedLoanId: loanId
    }
  });
  
  return trustScore;
}