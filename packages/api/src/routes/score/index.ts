import { FastifyInstance } from 'fastify';
import { calculateTrustScore } from '../../services/trust.service';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/me', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    
    // Calculate the trust score using the new credit-bureau-inspired model
    const scoreData = await calculateTrustScore(fastify, userId);
    
    return reply.send(scoreData);
  });
}