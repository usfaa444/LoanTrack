import { FastifyInstance } from 'fastify';
import { registerWithEmail } from '../../services/auth.service';
import { emailRegisterJsonSchema } from '../../schemas/auth.schema';
import { emailRegisterSchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/email/register', {
    schema: {
      body: emailRegisterJsonSchema,
    },
  }, async (request, reply) => {
    try {
      const { email, password, displayName } = request.body as { email: string; password: string; displayName: string };
      
      // Validate request
      const validationResult = emailRegisterSchema.safeParse({ email, password, displayName });
      if (!validationResult.success) {
        return reply.status(400).send({ 
          error: 'Validation failed', 
          details: validationResult.error.flatten() 
        });
      }
      
      const user = await registerWithEmail(fastify.db, email, password, displayName);
      if (!user) return reply.status(500).send({ error: 'Failed to register user' });
      
      return reply.send({ success: true, user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (error: any) {
      console.error('[Auth] Email registration error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}