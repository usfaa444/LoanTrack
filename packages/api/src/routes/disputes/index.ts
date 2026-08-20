import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/disputes — raise a dispute
  fastify.post('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { loanId, reason } = request.body as any;
    if (!loanId || !reason) return reply.status(400).send({ error: 'loanId and reason required' });

    const loan = await fastify.db.loan.findUnique({ where: { id: loanId } });
    if (!loan) return reply.status(404).send({ error: 'Loan not found' });
    if (loan.lenderId !== userId && loan.borrowerId !== userId) {
      return reply.status(403).send({ error: 'Must be lender or borrower' });
    }

    const dispute = await fastify.db.dispute.create({
      data: { loanId, raisedBy: userId, reason },
    });
    return reply.status(201).send(dispute);
  });

  // GET /v1/disputes — list user's disputes
  fastify.get('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const disputes = await fastify.db.dispute.findMany({
      where: { raisedBy: userId },
      include: { loan: { select: { id: true, amount: true, purpose: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(disputes);
  });

  // PATCH /v1/disputes/:id — update resolution
  fastify.patch('/:id', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    const { status, resolution } = request.body as any;

    const dispute = await fastify.db.dispute.findUnique({ where: { id } });
    if (!dispute) return reply.status(404).send({ error: 'Dispute not found' });
    if (dispute.raisedBy !== userId) return reply.status(403).send({ error: 'Not your dispute' });

    const updated = await fastify.db.dispute.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(resolution ? { resolution } : {}),
        ...(status === 'resolved' || status === 'rejected' ? { resolvedAt: new Date() } : {}),
      },
    });
    return reply.send(updated);
  });
}