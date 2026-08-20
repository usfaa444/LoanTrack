import { FastifyInstance } from 'fastify';
import { createHash, createHmac } from 'crypto';

const SIGNING_SECRET = process.env.SIGNING_SECRET || 'dev-signing-secret';

function signPayload(payload: any, prevHash?: string) {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const hash = createHash('sha256').update(canonical).digest('hex');
  const data = hash + (prevHash || '');
  const signature = createHmac('sha256', SIGNING_SECRET).update(data).digest('hex');
  return { hash, signature };
}

export default async function routes(fastify: FastifyInstance) {
  // GET /:id/receipt
  fastify.get('/:id/receipt', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id: loanId } = request.params as any;
    const loan = await fastify.db.loan.findUnique({
      where: { id: loanId },
      include: { payments: true, lender: { select: { id: true, phone: true, displayName: true } }, borrower: { select: { id: true, phone: true, displayName: true } } },
    });
    if (!loan) return reply.status(404).send({ error: 'Loan not found' });
    if (loan.lenderId !== userId && loan.borrowerId !== userId) return reply.status(403).send({ error: 'Not authorized' });

    // Get last signed record for prevHash chaining
    const lastRecord = await fastify.db.signedRecord.findFirst({ orderBy: { signedAt: 'desc' } });
    const prevHash = lastRecord?.payloadHash || null;

    const payload = {
      loanId: loan.id, amount: Number(loan.amount), currency: loan.currency,
      status: loan.status, dueDate: loan.dueDate, createdAt: loan.createdAt,
      lender: loan.lender.phone, borrower: loan.borrower.phone,
      payments: loan.payments.map(p => ({ amount: Number(p.amount), paidAt: p.paidAt, method: p.method })),
    };
    const { hash, signature } = signPayload(payload, prevHash);

    // Upsert: replace if exists
    const existing = await fastify.db.signedRecord.findUnique({ where: { loanId } });
    if (existing) {
      await fastify.db.signedRecord.update({ where: { loanId }, data: { payloadHash: hash, signature, prevHash, payload } });
    } else {
      await fastify.db.signedRecord.create({ data: { loanId, payloadHash: hash, signature, prevHash, payload } });
    }

    return reply.send({ payloadHash: hash, signature, prevHash, payload });
  });

  // GET /:id/verify
  fastify.get('/:id/verify', async (request, reply) => {
    const { id: loanId } = request.params as any;
    const record = await fastify.db.signedRecord.findUnique({ where: { loanId } });
    if (!record) return reply.status(404).send({ error: 'No signed record found' });

    const { hash } = signPayload(record.payload, record.prevHash || undefined);
    const valid = hash === record.payloadHash;
    return reply.send({ valid, payloadHash: record.payloadHash, computedHash: hash, signedAt: record.signedAt });
  });
}