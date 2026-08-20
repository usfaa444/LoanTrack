import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // POST /:id/memos — create voice memo on a loan
  fastify.post('/:id/memos', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id: loanId } = request.params as any;
    const { url, durationSecs } = request.body as any;
    if (!url) return reply.status(400).send({ error: 'url required' });

    const loan = await fastify.db.loan.findUnique({ where: { id: loanId } });
    if (!loan) return reply.status(404).send({ error: 'Loan not found' });
    if (loan.lenderId !== userId && loan.borrowerId !== userId) {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    const memo = await fastify.db.voiceMemo.create({
      data: { loanId, url, durationSecs: durationSecs || 0, recordedById: userId },
    });
    return reply.status(201).send(memo);
  });

  // GET /:id/memos — list voice memos for a loan
  fastify.get('/:id/memos', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id: loanId } = request.params as any;

    const loan = await fastify.db.loan.findUnique({ where: { id: loanId } });
    if (!loan) return reply.status(404).send({ error: 'Loan not found' });
    if (loan.lenderId !== userId && loan.borrowerId !== userId) {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    const memos = await fastify.db.voiceMemo.findMany({
      where: { loanId },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(memos);
  });
}