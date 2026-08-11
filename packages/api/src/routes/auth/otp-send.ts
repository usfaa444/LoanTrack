import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { sendOtpService } from '../../services/auth.service';
import { otpSendSchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/auth/otp/send
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/otp/send',
    {
      schema: {
        description: 'Send OTP to a phone number',
        tags: ['auth'],
        body: otpSendSchema,
        response: {
          200: Type.Object({
            success: Type.Boolean()
          }),
          400: Type.Object({
            error: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const { phone } = request.body;
        
        const success = await sendOtpService(fastify, phone);
        
        if (!success) {
          return reply.status(500).send({
            error: 'Failed to send OTP'
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