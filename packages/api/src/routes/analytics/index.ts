import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // GET /v1/analytics/purposes — aggregate loans by purposeCode
  fastify.get('/purposes', async (request, reply) => {
    const query = request.query as any;
    const loans = await fastify.db.loan.groupBy({
      by: ['purposeCode'],
      where: {
        purposeCode: { not: null },
        ...(query.from || query.to ? {
          createdAt: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          }
        } : {}),
      },
      _count: { id: true },
      _sum: { amount: true },
    });
    return reply.send(loans.map(l => ({
      purposeCode: l.purposeCode,
      count: l._count.id,
      totalAmount: Number(l._sum.amount || 0),
    })));
  });

  // GET /v1/analytics/regions — aggregate loans by user region
  fastify.get('/regions', async (request, reply) => {
    const loans = await fastify.db.loan.findMany({
      select: {
        amount: true,
        lender: { select: { region: true, city: true } },
      },
      where: { lender: { region: { not: null } } },
    });
    const regions: Record<string, { count: number; totalAmount: number }> = {};
    for (const l of loans) {
      const key = l.lender.region + (l.lender.city ? ` / ${l.lender.city}` : '');
      if (!regions[key]) regions[key] = { count: 0, totalAmount: 0 };
      regions[key].count++;
      regions[key].totalAmount += Number(l.amount);
    }
    return reply.send(Object.entries(regions).map(([region, data]) => ({ region, ...data })));
  });

  // GET /v1/analytics/wallets — user count by preferredWallet
  fastify.get('/wallets', async (request, reply) => {
    const users = await fastify.db.user.groupBy({
      by: ['preferredWallet'],
      where: { preferredWallet: { not: null } },
      _count: { id: true },
    });
    return reply.send(users.map(u => ({
      wallet: u.preferredWallet,
      count: u._count.id,
    })));
  });

  // GET /v1/analytics/seasonal — monthly borrowing trends
  fastify.get('/seasonal', async (request, reply) => {
    const loans = await fastify.db.loan.findMany({
      select: { amount: true, createdAt: true },
    });
    const months: Record<string, { count: number; totalAmount: number }> = {};
    for (const l of loans) {
      const key = l.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!months[key]) months[key] = { count: 0, totalAmount: 0 };
      months[key].count++;
      months[key].totalAmount += Number(l.amount);
    }
    return reply.send(Object.entries(months).sort().map(([month, data]) => ({ month, ...data })));
  });
}