import { FastifyInstance } from 'fastify';
import { getDashboardStats } from '../../services/dashboard.service';
import { PrismaClient } from '@prisma/client';

export default async function routes(fastify: FastifyInstance) {
  // GET /v1/dashboard - Get dashboard statistics
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get dashboard statistics',
        tags: ['dashboard'],
        response: {
          200: {
            type: 'object',
            properties: {
              activeLoansAsLender: { type: 'number' },
              activeLoansAsBorrower: { type: 'number' },
              overdueLoansAsLender: { type: 'number' },
              overdueLoansAsBorrower: { type: 'number' },
              paidLoansAsLender: { type: 'number' },
              paidLoansAsBorrower: { type: 'number' },
              totalLent: { type: 'number' },
              totalBorrowed: { type: 'number' },
              totalRepaidToUser: { type: 'number' },
              totalRepaidByUser: { type: 'number' }
            }
          },
          401: {
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
        
        const stats = await getDashboardStats(fastify.db as unknown as PrismaClient, userId);
        
        return stats;
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
}