import { FastifyInstance } from 'fastify';
import { recordPayment, listPayments } from '../../services/payment.service';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/:id/payments', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { id } = request.params as { id: string };
    const payment = await recordPayment(fastify.db, { loanId: id, ...request.body as any }, userId);
    return reply.status(201).send(payment);
  });

  fastify.get('/:id/payments', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { id } = request.params as { id: string };
    const payments = await listPayments(fastify.db, id, userId);
    return reply.send(payments);
  });
}