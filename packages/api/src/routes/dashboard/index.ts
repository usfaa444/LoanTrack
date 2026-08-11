import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/', {
    onRequest: fastify.authenticate,
  }, async (request) => {
    const userId = (request.user as any)?.id;
    const db = fastify.db;

    const [activeLoans, paidLoans, overdueLoans, totalLent, totalBorrowed, recentLoans] = await Promise.all([
      db.loan.count({ where: { lenderId: userId, status: 'ACTIVE' } }),
      db.loan.count({ where: { lenderId: userId, status: 'PAID' } }),
      db.loan.count({ where: { lenderId: userId, status: 'OVERDUE' } }),
      db.loan.aggregate({ where: { lenderId: userId, status: { in: ['ACTIVE', 'OVERDUE'] } }, _sum: { remainingBalance: true } }),
      db.loan.aggregate({ where: { borrowerId: userId, status: { in: ['ACTIVE', 'OVERDUE'] } }, _sum: { remainingBalance: true } }),
      db.loan.findMany({ where: { OR: [{ lenderId: userId }, { borrowerId: userId }] }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    return {
      activeLoans,
      paidLoans,
      overdueLoans,
      totalLent: (totalLent._sum as any).remainingBalance ?? 0,
      totalBorrowed: (totalBorrowed._sum as any).remainingBalance ?? 0,
      recentLoans,
    };
  });
}