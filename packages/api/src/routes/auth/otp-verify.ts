import { FastifyInstance } from 'fastify';
import { verifyOtpService } from '../../services/auth.service';
import { otpVerifyJsonSchema } from '../../schemas/auth.schema';
import { config } from '../../config';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/otp/verify', {
    schema: { body: otpVerifyJsonSchema },
  }, async (request, reply) => {
    const { phone, code } = request.body as { phone: string; code: string };
    const user = await verifyOtpService(fastify.db, phone, code);
    if (!user) return reply.status(400).send({ error: 'Invalid OTP' });
    const token = fastify.jwt.sign({ id: user.id, phone: user.phone });
    return reply.send({ success: true, token, user: { id: user.id, phone: user.phone, hasPinSet: user.hasPinSet } });
  });
}