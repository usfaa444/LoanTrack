import { FastifyInstance } from 'fastify';
import { recordPayment, listPayments } from '../../services/payment.service';
import { paymentCreateSchema } from '../../schemas/base.schema';
import { PrismaClient } from '@prisma/client';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/loans/:id/payments - Record a payment
  fastify.post(
    '/:id/payments',
    {
      schema: {
        description: 'Record a payment for a loan',
        tags: ['payments'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        body: paymentCreateSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              loanId: { type: 'string' },
              amount: { type: 'number' },
              method: { type: 'string' },
              note: { type: 'string' },
              purposeTag: { type: 'string' },
              paidAt: { type: 'string' },
              recordedById: { type: 'string' },
              createdAt: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        const { id: loanId } = request.params as { id: string };
        const paymentData = request.body as any;
        
        // Ensure loanId in body matches param
        if (paymentData.loanId !== loanId) {
          return reply.status(400).send({
            error: 'Loan ID mismatch'
          });
        }
        
        const payment = await recordPayment(fastify.db as unknown as PrismaClient, paymentData, userId);
        
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
  fastify.get(
    '/:id/payments',
    {
      schema: {
        description: 'List payments for a loan',
        tags: ['payments'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                loanId: { type: 'string' },
                amount: { type: 'number' },
                method: { type: 'string' },
                note: { type: 'string' },
                purposeTag: { type: 'string' },
                paidAt: { type: 'string' },
                recordedById: { type: 'string' },
                createdAt: { type: 'string' }
              }
            }
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        const { id: loanId } = request.params as { id: string };
        
        const payments = await listPayments(fastify.db as unknown as PrismaClient, loanId, userId);
        
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