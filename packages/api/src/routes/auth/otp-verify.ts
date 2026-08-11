import { FastifyInstance } from 'fastify';
import { verifyOtpService } from '../../services/auth.service';
import { otpVerifySchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/auth/otp/verify
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/otp/verify',
    {
      schema: {
        description: 'Verify OTP for a phone number',
        tags: ['auth'],
        body: otpVerifySchema,
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            token: Type.Optional(Type.String()),
            user: Type.Optional(Type.Object({
              id: Type.String(),
              phone: Type.String(),
              hasPinSet: Type.Boolean()
            }))
          }),
          400: Type.Object({
            error: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const { phone, code } = request.body;
        
        const user = await verifyOtpService(fastify, phone, code);
        
        if (!user) {
          return reply.status(401).send({
            error: 'Invalid OTP code'
          });
        }
        
        // Generate JWT token
        const token = fastify.jwt.sign({
          sub: user.id,
          phone: user.phone
        });
        
        return {
          success: true,
          token: token,
          user: {
            id: user.id,
            phone: user.phone,
            hasPinSet: user.hasPinSet
          }
        };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
}