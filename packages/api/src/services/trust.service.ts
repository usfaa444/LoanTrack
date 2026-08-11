import { FastifyInstance } from 'fastify';

/**
 * Calculate trust score for a user
 * @param app Fastify instance
 * @param userId User ID
 * @returns Promise resolving to trust score data
 */
export async function calculateTrustScore(app: FastifyInstance, userId: string): Promise<any> {
  // Base score
  let baseScore = 300;
  
  // Get user's loans for repayment analysis
  const loans = await app.db.loan.findMany({
    where: {
      borrowerId: userId,
      deletedAt: null
    },
    include: {
      payments: true
    }
  });
  
  // Repayment bonus
  let repaymentBonus = 0;
  let defaultPenalty = 0;
  let tenureBonus = 0;
  let volumeBonus = 0;
  
  // Analyze each loan
  for (const loan of loans) {
    // Tenure bonus (1 point per month of loan age)
    const loanAgeMs = Date.now() - new Date(loan.createdAt).getTime();
    const loanAgeMonths = Math.floor(loanAgeMs / (1000 * 60 * 60 * 24 * 30));
    tenureBonus += loanAgeMonths;
    
    // Volume bonus (0.1% of loan amount, capped at 50 points)
    const loanVolumePoints = Math.min(50, Math.floor(Number(loan.amount) * 0.001));
    volumeBonus += loanVolumePoints;
    
    // Repayment analysis
    if (loan.status === 'PAID') {
      // On-time repayment bonus
      const expectedPayments = Number(loan.amount);
      const actualPayments = loan.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      
      if (actualPayments >= expectedPayments) {
        // Full repayment bonus (10 points per loan)
        repaymentBonus += 10;
      } else {
        // Partial repayment bonus (proportional)
        repaymentBonus += Math.floor(10 * (actualPayments / expectedPayments));
      }
    } else if (loan.status === 'OVERDUE' || loan.status === 'DISPUTED') {
      // Default penalty (5 points per defaulted loan)
      defaultPenalty += 5;
    }
  }
  
  // Calculate final score
  let score = baseScore + repaymentBonus - defaultPenalty + tenureBonus + volumeBonus;
  
  // Clamp score between 0 and 1000
  score = Math.max(0, Math.min(1000, score));
  
  // Determine tier based on score
  let tier = 'BUILDING'; // Default tier
  if (score >= 800) {
    tier = 'EXEMPLARY';
  } else if (score >= 650) {
    tier = 'TRUSTED';
  } else if (score >= 500) {
    tier = 'RELIABLE';
  } else if (score >= 400) {
    tier = 'BUILDING';
  } else {
    tier = 'UNTRUSTED';
  }
  
  return {
    score,
    tier,
    baseScore,
    repaymentBonus,
    defaultPenalty,
    tenureBonus,
    volumeBonus
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
    
    trustScore = await app.db.trustScore.create({
      data: {
        userId: userId,
        score: calculatedScore.score,
        tier: calculatedScore.tier,
        baseScore: calculatedScore.baseScore,
        repaymentBonus: calculatedScore.repaymentBonus,
        defaultPenalty: calculatedScore.defaultPenalty,
        tenureBonus: calculatedScore.tenureBonus,
        volumeBonus: calculatedScore.volumeBonus
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
  eventType: string,
  loanId?: string
): Promise<any> {
  // Recalculate trust score
  const calculatedScore = await calculateTrustScore(app, userId);
  
  // Update or create trust score record
  const trustScore = await app.db.trustScore.upsert({
    where: {
      userId: userId
    },
    update: {
      score: calculatedScore.score,
      tier: calculatedScore.tier,
      baseScore: calculatedScore.baseScore,
      repaymentBonus: calculatedScore.repaymentBonus,
      defaultPenalty: calculatedScore.defaultPenalty,
      tenureBonus: calculatedScore.tenureBonus,
      volumeBonus: calculatedScore.volumeBonus,
      updatedAt: new Date()
    },
    create: {
      userId: userId,
      score: calculatedScore.score,
      tier: calculatedScore.tier,
      baseScore: calculatedScore.baseScore,
      repaymentBonus: calculatedScore.repaymentBonus,
      defaultPenalty: calculatedScore.defaultPenalty,
      tenureBonus: calculatedScore.tenureBonus,
      volumeBonus: calculatedScore.volumeBonus
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