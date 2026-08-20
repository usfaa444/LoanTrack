import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // PATCH /:id — correct a payment
  fastify.patch('/:id', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id: paymentId } = request.params as any;
    const { newAmount, reason } = request.body as any;
    if (!newAmount || !reason) return reply.status(400).send({ error: 'newAmount and reason required' });

    const payment = await fastify.db.payment.findUnique({ where: { id: paymentId }, include: { loan: true } });
    if (!payment) return reply.status(404).send({ error: 'Payment not found' });
    const loan = payment.loan;
    if (loan.lenderId !== userId && loan.borrowerId !== userId) return reply.status(403).send({ error: 'Not authorized' });

    const oldAmount = Number(payment.amount);
    await fastify.db.$transaction([
      fastify.db.paymentCorrection.create({
        data: { paymentId, oldAmount, newAmount: Number(newAmount), reason, correctedBy: userId },
      }),
      fastify.db.payment.update({ where: { id: paymentId }, data: { amount: Number(newAmount) } }),
    ]);

    // Recompute balance
    const sumResult = await fastify.db.payment.aggregate({ where: { loanId: loan.id }, _sum: { amount: true } });
    const totalPaid = Number(sumResult._sum.amount || 0);
    const remaining = Number(loan.amount) - totalPaid;
    await fastify.db.loan.update({ where: { id: loan.id }, data: { remainingBalance: remaining, ...(remaining <= 0 ? { status: 'PAID', paidAt: new Date() } : {}) } });

    return reply.send({ success: true, remainingBalance: remaining });
  });

  // GET /pending — list pending confirmations
  fastify.get('/pending', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const confirmations = await fastify.db.paymentConfirmation.findMany({
      where: { confirmedById: userId, status: { in: ['PENDING', null] } },
      include: { loan: { select: { id: true, amount: true, purpose: true } } },
      orderBy: { confirmedAt: 'desc' },
    });
    return reply.send(confirmations);
  });

  // POST /:id/confirm — confirm a payment
  fastify.post('/:id/confirm', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    const confirmation = await fastify.db.paymentConfirmation.findUnique({ where: { id } });
    if (!confirmation) return reply.status(404).send({ error: 'Confirmation not found' });
    if (confirmation.confirmedById !== userId) return reply.status(403).send({ error: 'Not your confirmation' });

    await fastify.db.paymentConfirmation.update({ where: { id }, data: { status: 'CONFIRMED' } });
    return reply.send({ success: true });
  });
}