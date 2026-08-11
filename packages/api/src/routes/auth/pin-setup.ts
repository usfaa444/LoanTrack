import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { setupPinService } from '../../services/auth.service';
import { pinSetupSchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/auth/pin/setup
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/pin/setup',
    {
      schema: {
        description: 'Set up PIN for authenticated user',
        tags: ['auth'],
        body: pinSetupSchema,
        response: {
          200: Type.Object({
            success: Type.Boolean()
          }),
          400: Type.Object({
            error: Type.String()
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
        const { pin } = request.body;
        const userId = (request.user as any).id;
        
        if (!userId) {
          return reply.status(401).send({
            error: 'Unauthorized'
          });
        }
        
        const success = await setupPinService(fastify, userId, pin);
        
        if (!success) {
          return reply.status(500).send({
            error: 'Failed to set up PIN'
          });
        }
        
        return { success: true };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
}