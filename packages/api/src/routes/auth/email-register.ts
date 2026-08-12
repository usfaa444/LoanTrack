import { FastifyInstance } from 'fastify';
import { createUser, signInWithEmail } from '../../lib/firebase';
import { upsertUserByEmail } from '../../services/auth.service';
import { emailRegisterJsonSchema, emailLoginJsonSchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/email/register', {
    schema: { body: emailRegisterJsonSchema },
  }, async (request, reply) => {
    const { email, password, displayName } = request.body as any;
    try {
      const userRecord = await createUser(email, password, displayName);
      await upsertUserByEmail(fastify.db, email, displayName);
      const token = fastify.jwt.sign({ id: userRecord.uid, email });
      return reply.status(201).send({ success: true, token, user: { id: userRecord.uid, email, displayName } });
    } catch (e: any) {
      return reply.status(400).send({ error: e.message || 'Registration failed' });
    }
  });

  fastify.post('/email/login', {
    schema: { body: emailLoginJsonSchema },
  }, async (request, reply) => {
    const { email, password } = request.body as any;
    const result = await signInWithEmail(email, password);
    if (!result) return reply.status(401).send({ error: 'Invalid credentials' });
    const token = fastify.jwt.sign({ id: result.localId, email });
    return reply.send({ success: true, token, user: { id: result.localId, email } });
  });
}