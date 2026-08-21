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

    // Normalize rotationOrder to {phone, displayName?}[]
    const entries: { phone: string; displayName?: string }[] = rotationOrder.map((e: any) =>
      typeof e === 'string' ? { phone: e } : { phone: e.phone, displayName: e.displayName }
    );
    const phones = entries.map(e => e.phone);

    // Find any registered users matching these phones
    const existingUsers = await fastify.db.user.findMany({
      where: { phone: { in: phones } },
      select: { id: true, phone: true },
    });
    const phoneToUserId = new Map(existingUsers.map(u => [u.phone, u.id]));

    const tontine = await fastify.db.tontine.create({
      data: {
        name, contributionAmount, currency: currency || 'XOF', frequency: frequency || 'monthly',
        rotationOrder: phones, createdBy: userId, startDate: new Date(),
        members: {
          create: entries.map((e, i) => ({
            phone: e.phone,
            displayName: e.displayName || null,
            userId: phoneToUserId.get(e.phone) || null,
            order: i,
          })),
        },
      },
      include: { members: true },
    });
    return reply.status(201).send(tontine);
  });

  // POST /:id/link — backfill userId when unregistered member creates an account
  fastify.post('/:id/link', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    // Get the user's phone to find their membership
    const user = await fastify.db.user.findUnique({ where: { id: userId }, select: { phone: true } });
    if (!user?.phone) return reply.status(400).send({ error: 'No phone on your account' });

    const member = await fastify.db.tontineMember.findFirst({
      where: { tontineId: id, phone: user.phone },
    });
    if (!member) return reply.status(404).send({ error: 'No membership found for your phone in this tontine' });
    if (member.userId) return reply.send({ success: true, alreadyLinked: true });

    await fastify.db.tontineMember.update({ where: { id: member.id }, data: { userId } });
    return reply.send({ success: true, linked: true });
  });

  // GET / — list user's tontines
  fastify.get('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const user = await fastify.db.user.findUnique({ where: { id: userId }, select: { phone: true } });
    const tontines = await fastify.db.tontine.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { members: { some: { userId } } },
          ...(user?.phone ? [{ members: { some: { phone: user.phone } } }] : []),
        ],
      },
      include: { members: { orderBy: { order: 'asc' } } },
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
    const user = await fastify.db.user.findUnique({ where: { id: userId }, select: { phone: true } });
    const tontine = await fastify.db.tontine.findUnique({
      where: { id },
      include: { members: { orderBy: { order: 'asc' } } },
    });
    if (!tontine) return reply.status(404).send({ error: 'Tontine not found' });
    const isMember = tontine.createdBy === userId ||
      tontine.members.some((m: any) => m.userId === userId) ||
      (!!user?.phone && tontine.members.some((m: any) => m.phone === user.phone));
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
    const nextMember = tontine.members[nextIdx];
    return reply.send({
      currentIdx: nextIdx,
      nextHolder: { phone: nextMember?.phone, displayName: nextMember?.displayName, userId: nextMember?.userId },
    });
  });

  // GET /:id/status
  fastify.get('/:id/status', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as any;
    const tontine = await fastify.db.tontine.findUnique({
      where: { id },
      include: { members: { orderBy: { order: 'asc' } } },
    });
    if (!tontine) return reply.status(404).send({ error: 'Tontine not found' });
    return reply.send({
      currentHolder: tontine.members[tontine.currentIdx],
      nextHolder: tontine.members[(tontine.currentIdx + 1) % tontine.members.length],
      members: tontine.members.map((m: any) => ({
        phone: m.phone,
        displayName: m.displayName,
        userId: m.userId,
        registered: !!m.userId,
        hasPaid: m.hasPaid,
        order: m.order,
      })),
      cycleComplete: tontine.currentIdx === 0,
    });
  });
}