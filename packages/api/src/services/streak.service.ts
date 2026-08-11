import { FastifyInstance } from 'fastify';

/**
 * Update loan-free streak for user
 * @param app Fastify instance
 * @param userId User ID
 * @returns Promise resolving to updated streak data
 */
export async function updateStreak(app: FastifyInstance, userId: string): Promise<any> {
  // Check if user has any active loans
  const activeLoansCount = await app.db.loan.count({
    where: {
      borrowerId: userId,
      status: 'ACTIVE',
      deletedAt: null
    }
  });
  
  // Get current streak record
  let streak = await app.db.loanFreeStreak.findUnique({
    where: {
      userId: userId
    }
  });
  
  // If user has no active loans, increment streak
  if (activeLoansCount === 0) {
    if (streak) {
      // Update existing streak
      streak = await app.db.loanFreeStreak.update({
        where: {
          userId: userId
        },
        data: {
          currentStreak: {
            increment: 1
          },
          longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
          updatedAt: new Date()
        }
      });
    } else {
      // Create new streak record
      streak = await app.db.loanFreeStreak.create({
        data: {
          userId: userId,
          currentStreak: 1,
          longestStreak: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  } else {
    // User has active loans, reset current streak if it was > 0
    if (streak && streak.currentStreak > 0) {
      streak = await app.db.loanFreeStreak.update({
        where: {
          userId: userId
        },
        data: {
          currentStreak: 0,
          lastResetAt: new Date(),
          lastResetReason: 'NEW_LOAN_CREATED',
          updatedAt: new Date()
        }
      });
    } else if (!streak) {
      // Create new streak record with 0 current streak
      streak = await app.db.loanFreeStreak.create({
        data: {
          userId: userId,
          currentStreak: 0,
          longestStreak: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  }
  
  return streak;
}

/**
 * Check for streak milestones and create records if achieved
 * @param app Fastify instance
 * @param userId User ID
 * @returns Promise resolving to array of achieved milestones
 */
export async function checkStreakMilestones(app: FastifyInstance, userId: string): Promise<any[]> {
  // Get current streak
  const streak = await app.db.loanFreeStreak.findUnique({
    where: {
      userId: userId
    }
  });
  
  if (!streak || streak.currentStreak === 0) {
    return [];
  }
  
  // Define milestone thresholds
  const milestones = [
    { days: 7, badge: 'WEEK_OF_FREEDOM' },
    { days: 30, badge: 'MONTHLY_MASTERY' },
    { days: 90, badge: 'QUARTERLY_CHAMPION' },
    { days: 180, badge: 'HALF_YEAR_HERO' },
    { days: 365, badge: 'DEBT_FREE_LEGEND' }
  ];
  
  const achievedMilestones = [];
  
  // Check each milestone
  for (const milestone of milestones) {
    // Skip if streak hasn't reached this milestone
    if (streak.currentStreak < milestone.days) {
      continue;
    }
    
    // Check if milestone already achieved
    const existingMilestone = await app.db.streakMilestone.findUnique({
      where: {
        userId_days: {
          userId: userId,
          days: milestone.days
        }
      }
    });
    
    // If not achieved yet, create record
    if (!existingMilestone) {
      const achievedMilestone = await app.db.streakMilestone.create({
        data: {
          userId: userId,
          days: milestone.days,
          badge: milestone.badge,
          achievedAt: new Date()
        }
      });
      
      achievedMilestones.push(achievedMilestone);
    }
  }
  
  return achievedMilestones;
}