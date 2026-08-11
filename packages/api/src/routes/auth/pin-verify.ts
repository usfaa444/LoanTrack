import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { verifyPinService } from '../../services/auth.service';
import { pinVerifySchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/auth/pin/verify
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/pin/verify',
    {
      schema: {
        description: 'Verify PIN for authenticated user',
        tags: ['auth'],
        body: pinVerifySchema,
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
        
        const isValid = await verifyPinService(fastify, userId, pin);
        
        if (!isValid) {
          return reply.status(401).send({
            error: 'Invalid PIN'
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