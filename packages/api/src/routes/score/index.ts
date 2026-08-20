import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/me', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;

    // Get user's loans
    const loansAsBorrower = await fastify.db.loan.findMany({
      where: { borrowerId: userId },
      include: { payments: true },
    });

    // Calculate metrics
    const totalLoans = loansAsBorrower.length;
    let paidOnTime = 0;
    let defaultedCount = 0;
    let totalAmount = 0;

    for (const loan of loansAsBorrower) {
      totalAmount += Number(loan.amount);
      if (loan.status === 'PAID' || loan.status === 'FORGIVEN') {
        paidOnTime++;
      }
      if (loan.status === 'OVERDUE' || loan.status === 'DISPUTED') {
        defaultedCount++;
      }
    }

    const onTimeRate = totalLoans > 0 ? paidOnTime / totalLoans : 0;
    const defaultRate = totalLoans > 0 ? defaultedCount / totalLoans : 0;
    const avgLoanAmount = totalLoans > 0 ? totalAmount / totalLoans : 0;

    // Streak data
    const streak = await fastify.db.loanFreeStreak.findUnique({ where: { userId } });
    const streakDays = streak?.currentStreak || 0;

    // Score calculation
    let score = 500;
    score += Math.round(onTimeRate * 300);
    score += Math.min(totalLoans * 5, 100);
    score -= Math.round(defaultRate * 200);
    score += Math.min(Math.round(avgLoanAmount / 1000), 50);
    score += Math.min(streakDays * 2, 50);
    score = Math.max(0, Math.min(1000, Math.round(score)));

    return reply.send({
      score,
      breakdown: {
        onTimeRate: Math.round(onTimeRate * 100),
        totalLoans,
        defaultedCount,
        avgLoanAmount: Math.round(avgLoanAmount),
        streakDays,
      },
    });
  });
}