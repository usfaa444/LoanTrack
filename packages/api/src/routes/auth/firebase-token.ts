import { FastifyInstance } from 'fastify';
import { verifyIdTokenService } from '../../services/auth.service';
import { firebaseTokenJsonSchema } from '../../schemas/auth.schema';
import { config } from '../../config';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/firebase/token', {
    schema: {
      body: firebaseTokenJsonSchema,
    },
  }, async (request, reply) => {
    try {
      const { idToken } = request.body as { idToken: string };
      
      // Verify Firebase ID token
      const user = await verifyIdTokenService(fastify.db, idToken);
      if (!user) return reply.status(401).send({ error: 'Invalid ID token' });
      
      // Issue internal JWT
      const token = fastify.jwt.sign({ id: user.id });
      
      return reply.send({ 
        success: true, 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          displayName: user.displayName, 
          hasPinSet: user.hasPinSet 
        } 
      });
    } catch (error: any) {
      console.error('[Auth] Firebase token verification error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}