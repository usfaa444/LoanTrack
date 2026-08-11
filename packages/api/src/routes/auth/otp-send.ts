import { FastifyInstance } from 'fastify';
import { sendOtpService } from '../../services/auth.service';
import { otpSendJsonSchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/otp/send', {
    schema: {
      body: otpSendJsonSchema,
    },
  }, async (request, reply) => {
    const { phone } = request.body as { phone: string };
    const success = await sendOtpService(fastify.db, phone);
    if (!success) return reply.status(500).send({ error: 'Failed to send OTP' });
    return reply.send({ success: true });
  });
}