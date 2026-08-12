import { FastifyInstance } from 'fastify';
import { otpSendJsonSchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/phone/send', {
    schema: {
      body: otpSendJsonSchema,
    },
  }, async (request, reply) => {
    // Placeholder implementation
    const { phone } = request.body as { phone: string };
    console.log(`[Auth] Phone OTP send requested for: ${phone} (placeholder)`);
    
    // In a real implementation, you would integrate with Firebase client SDK on mobile
    // or use Twilio or another SMS provider
    
    return reply.send({ success: true });
  });
}