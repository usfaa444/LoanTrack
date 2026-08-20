import { FastifyInstance, FastifyRequest } from 'fastify';
import { recordPayment, recordPaymentWithAutoBalance, listPayments } from '../../services/payment.service';

interface PaymentRequestBody {
  amount: number;
  method?: string;
  note?: string;
  paidAt?: string;
  autoBalance?: boolean; // NEW: Auto-balance flag
}

export default async function routes(fastify: FastifyInstance) {
  fastify.post<{ Params: { id: string }, Body: PaymentRequestBody }>('/:id/payments', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { id } = request.params;
    const { autoBalance, ...paymentData } = request.body;
    
    try {
      let payment;
      if (autoBalance) {
        // Use the new auto-balance feature
        payment = await recordPaymentWithAutoBalance(
          fastify.db, 
          { loanId: id, ...paymentData }, 
          userId, 
          true
        );
      } else {
        // Use the existing payment recording method
        payment = await recordPayment(
          fastify.db, 
          { loanId: id, ...paymentData }, 
          userId
        );
      }
      
      return reply.status(201).send(payment);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to record payment' });
    }
  });

  fastify.get<{ Params: { id: string } }>('/:id/payments', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { id } = request.params;
    
    try {
      const payments = await listPayments(fastify.db, id, userId);
      return reply.send(payments);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to list payments' });
    }
  });
}