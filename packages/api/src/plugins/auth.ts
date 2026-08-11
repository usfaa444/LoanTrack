import fp from 'fastify-plugin';
import { verifyJwt, extractUserClaims } from '../lib/jwt';

// Auth plugin
export default fp(async (app) => {
  // Decorate with auth utilities
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      
      // Extract user claims from token
      const claims = extractUserClaims(request.user);
      if (!claims) {
        return reply.status(401).send({
          error: 'Invalid token claims'
        });
      }
      
      // Attach user info to request
      request.user = {
        id: claims.userId,
        phone: claims.phone
      };
    } catch (err) {
      reply.status(401).send({
        error: 'Unauthorized'
      });
    }
  });
});

// TypeScript declaration
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
  
  interface FastifyRequest {
    user: {
      id: string;
      phone: string;
    } | null;
  }
}