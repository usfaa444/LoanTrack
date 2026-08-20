import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // GET / — WhatsApp webhook verification
  fastify.get('/', async (request, reply) => {
    const query = request.query as any;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    const expected = process.env.WHATSAPP_VERIFY_TOKEN || 'dev-wa-token';
    if (mode === 'subscribe' && token === expected) {
      return reply.type('text/plain').send(challenge);
    }
    return reply.status(403).send('Forbidden');
  });

  // POST / — receive WhatsApp message
  fastify.post('/', async (request, reply) => {
    try {
      const body = request.body as any;
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];
      if (!message) return reply.send({ status: 'no_message' });

      const fromPhone = message.from;
      const text = message.text?.body?.trim().toLowerCase() || '';

      // Update session
      await fastify.db.whatsAppSession.upsert({
        where: { phone: fromPhone },
        update: { state: 'idle', updatedAt: new Date() },
        create: { phone: fromPhone },
      });

      // Match user
      const user = await fastify.db.user.findFirst({ where: { phone: fromPhone } });
      if (!user) {
        return reply.send({ status: 'unknown_user', reply: 'Please register in the LoanTrack app first' });
      }

      // Parse commands
      let responseText = '';
      if (text.startsWith('credit') || text.startsWith('crédit')) {
        responseText = 'Credit noted. Amount and borrower needed. Usage: Credit <amount> to <name>';
      } else if (text.startsWith('paid') || text.startsWith('payé')) {
        responseText = 'Payment received. Amount needed. Usage: Paid <amount>';
      } else if (text.startsWith('balance') || text.startsWith('solde')) {
        const loans = await fastify.db.loan.findMany({
          where: { borrowerId: user.id, status: { in: ['ACTIVE', 'OVERDUE'] } },
        });
        const total = loans.reduce((sum, l) => sum + Number(l.remainingBalance), 0);
        responseText = `Your outstanding balance: ${total} FCFA`;
      } else if (text.startsWith('help') || text.startsWith('aide')) {
        responseText = 'Commands: Credit <amount>, Paid <amount>, Balance, Help';
      } else {
        responseText = 'Command not recognized. Type Help for options.';
      }

      return reply.send({ status: 'ok', reply: responseText });
    } catch (e: any) {
      return reply.send({ status: 'error', error: e.message });
    }
  });
}