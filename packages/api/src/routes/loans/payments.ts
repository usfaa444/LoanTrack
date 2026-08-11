import { FastifyInstance } from 'fastify';
import { recordPayment, listPayments } from '../../services/payment.service';
import { paymentCreateSchema } from '../../schemas/base.schema';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/loans/:id/payments - Record a payment
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/:id/payments',
    {
      schema: {
        description: 'Record a payment for a loan',
        tags: ['payments'],
        params: Type.Object({
          id: Type.String()
        }),
        body: paymentCreateSchema,
        response: {
          201: Type.Object({
            id: Type.String(),
            loanId: Type.String(),
            amount: Type.Number(),
            method: Type.String(),
            note: Type.Optional(Type.String()),
            purposeTag: Type.Optional(Type.String()),
            paidAt: Type.String(),
            recordedById: Type.String(),
            createdAt: Type.String()
          }),
          400: Type.Object({
            error: Type.String()
          }),
          401: Type.Object({
            error: Type.String()
          }),
          404: Type.Object({
            error: Type.String()
          })
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        const { id: loanId } = request.params;
        const paymentData = request.body;
        
        // Ensure loanId in body matches param
        if (paymentData.loanId !== loanId) {
          return reply.status(400).send({
            error: 'Loan ID mismatch'
          });
        }
        
        const payment = await recordPayment(fastify, paymentData, userId);
        
        return reply.status(201).send(payment);
      } catch (error: any) {
        if (error.message === 'Loan not found') {
          return reply.status(404).send({
            error: 'Loan not found'
          });
        }
        
        if (error.message === 'User does not have access to this loan') {
          return reply.status(403).send({
            error: 'Access denied'
          });
        }
        
        if (error.message === 'Cannot record payment for loan in current status') {
          return reply.status(400).send({
            error: 'Cannot record payment for loan in current status'
          });
        }
        
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
  
  // GET /v1/loans/:id/payments - List payments for a loan
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/:id/payments',
    {
      schema: {
        description: 'List payments for a loan',
        tags: ['payments'],
        params: Type.Object({
          id: Type.String()
        }),
        response: {
          200: Type.Array(Type.Object({
            id: Type.String(),
            loanId: Type.String(),
            amount: Type.Number(),
            method: Type.String(),
            note: Type.Optional(Type.String()),
            purposeTag: Type.Optional(Type.String()),
            paidAt: Type.String(),
            recordedById: Type.String(),
            createdAt: Type.String()
          })),
          401: Type.Object({
            error: Type.String()
          }),
          404: Type.Object({
            error: Type.String()
          })
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        const { id: loanId } = request.params;
        
        const payments = await listPayments(fastify, loanId, userId);
        
        return payments;
      } catch (error: any) {
        if (error.message === 'Loan not found') {
          return reply.status(404).send({
            error: 'Loan not found'
          });
        }
        
        if (error.message === 'User does not have access to this loan') {
          return reply.status(403).send({
            error: 'Access denied'
          });
        }
        
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
}