import { FastifyInstance } from 'fastify';
import { getDashboardStats } from '../../services/dashboard.service';

export default async function routes(fastify: FastifyInstance) {
  // GET /v1/dashboard - Get dashboard statistics
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        description: 'Get dashboard statistics',
        tags: ['dashboard'],
        response: {
          200: Type.Object({
            activeLoansAsLender: Type.Number(),
            activeLoansAsBorrower: Type.Number(),
            overdueLoansAsLender: Type.Number(),
            overdueLoansAsBorrower: Type.Number(),
            paidLoansAsLender: Type.Number(),
            paidLoansAsBorrower: Type.Number(),
            totalLent: Type.Number(),
            totalBorrowed: Type.Number(),
            totalRepaidToUser: Type.Number(),
            totalRepaidByUser: Type.Number()
          }),
          401: Type.Object({
            error: Type.String()
          })
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        
        const stats = await getDashboardStats(fastify, userId);
        
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