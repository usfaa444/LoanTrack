import { FastifyInstance } from 'fastify';
import { verifyIdToken } from '../../lib/firebase';
import { upsertUserByPhone } from '../../services/auth.service';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/firebase/token', async (request, reply) => {
    const { idToken } = request.body as any;
    if (!idToken) return reply.status(400).send({ error: 'idToken required' });
    try {
      const decoded = await verifyIdToken(idToken);
      const phone = (decoded as any).phone_number || (decoded as any).phone || '';
      if (!phone) return reply.status(400).send({ error: 'No phone in token' });
      
      const dbUser = await upsertUserByPhone(fastify.db, phone);
      const token = fastify.jwt.sign({ id: decoded.uid, phone });
      return reply.send({ success: true, token, user: { id: dbUser.id, phone, hasPinSet: dbUser.hasPinSet } });
    } catch (e: any) {
      return reply.status(401).send({ error: 'Invalid token' });
    }
  });
}