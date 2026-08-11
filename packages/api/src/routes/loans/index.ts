import { FastifyInstance } from 'fastify';
import { createLoan, getLoan, updateLoan, deleteLoan, listLoans } from '../../services/loan.service';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/loans — create loan
  fastify.post('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const body = request.body as any;
    if (userId !== body.lenderId && userId !== body.borrowerId) {
      return reply.status(403).send({ error: 'Must be lender or borrower' });
    }
    const loan = await createLoan(fastify.db, body, userId);
    return reply.status(201).send(loan);
  });

  // GET /v1/loans — list user's loans
  fastify.get('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const query = request.query as any;
    const loans = await listLoans(fastify.db, userId, {
      status: query.status,
      asLender: query.asLender !== 'false',
      asBorrower: query.asBorrower !== 'false',
    });
    return reply.send(loans);
  });

  // GET /v1/loans/:id — get single loan
  fastify.get('/:id', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { id } = request.params as { id: string };
    const loan = await getLoan(fastify.db, id, userId);
    if (!loan) return reply.status(404).send({ error: 'Loan not found' });
    return reply.send(loan);
  });

  // PATCH /v1/loans/:id — update loan
  fastify.patch('/:id', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { id } = request.params as { id: string };
    const loan = await updateLoan(fastify.db, id, request.body as any, userId);
    return reply.send(loan);
  });

  // DELETE /v1/loans/:id — delete loan
  fastify.delete('/:id', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { id } = request.params as { id: string };
    await deleteLoan(fastify.db, id, userId);
    return reply.send({ success: true });
  });
}