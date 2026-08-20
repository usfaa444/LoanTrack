import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // POST / — create tontine
  fastify.post('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { name, contributionAmount, currency, frequency, rotationOrder } = request.body as any;
    if (!name || !contributionAmount || !rotationOrder?.length) {
      return reply.status(400).send({ error: 'name, contributionAmount, rotationOrder required' });
    }
    const tontine = await fastify.db.tontine.create({
      data: {
        name, contributionAmount, currency: currency || 'XOF', frequency: frequency || 'monthly',
        rotationOrder, createdBy: userId, startDate: new Date(),
        members: {
          create: rotationOrder.map((uid: string, i: number) => ({ userId: uid, order: i })),
        },
      },
      include: { members: true },
    });
    return reply.status(201).send(tontine);
  });

  // GET / — list user's tontines
  fastify.get('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const tontines = await fastify.db.tontine.findMany({
      where: { OR: [{ createdBy: userId }, { members: { some: { userId } } }] },
      include: { members: { include: { user: { select: { id: true, phone: true, displayName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(tontines);
  });

  // GET /:id — get single tontine
  fastify.get('/:id', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    const tontine = await fastify.db.tontine.findUnique({
      where: { id },
      include: { members: { include: { user: { select: { id: true, phone: true, displayName: true } } }, orderBy: { order: 'asc' } } },
    });
    if (!tontine) return reply.status(404).send({ error: 'Tontine not found' });
    const isMember = tontine.members.some((m: any) => m.userId === userId) || tontine.createdBy === userId;
    if (!isMember) return reply.status(403).send({ error: 'Not a member' });
    return reply.send(tontine);
  });

  // POST /:id/rotate
  fastify.post('/:id/rotate', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    const tontine = await fastify.db.tontine.findUnique({ where: { id }, include: { members: { orderBy: { order: 'asc' } } } });
    if (!tontine) return reply.status(404).send({ error: 'Tontine not found' });
    if (tontine.createdBy !== userId) return reply.status(403).send({ error: 'Only creator can rotate' });

    const currentMember = tontine.members[tontine.currentIdx];
    if (!currentMember) return reply.status(400).send({ error: 'No current member' });

    await fastify.db.tontineMember.update({
      where: { id: currentMember.id }, data: { hasPaid: true, paidAt: new Date() },
    });
    const nextIdx = (tontine.currentIdx + 1) % tontine.members.length;
    await fastify.db.tontine.update({ where: { id }, data: { currentIdx: nextIdx } });
    return reply.send({ currentIdx: nextIdx, nextHolder: tontine.members[nextIdx]?.userId });
  });

  // GET /:id/status
  fastify.get('/:id/status', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    const tontine = await fastify.db.tontine.findUnique({
      where: { id },
      include: { members: { orderBy: { order: 'asc' }, include: { user: { select: { displayName: true, phone: true } } } } },
    });
    if (!tontine) return reply.status(404).send({ error: 'Tontine not found' });
    return reply.send({
      currentHolder: tontine.members[tontine.currentIdx],
      nextHolder: tontine.members[(tontine.currentIdx + 1) % tontine.members.length],
      members: tontine.members.map((m: any) => ({ id: m.userId, name: m.user.displayName, hasPaid: m.hasPaid, order: m.order })),
      cycleComplete: tontine.currentIdx === 0,
    });
  });
}