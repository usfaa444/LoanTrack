import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // GET /queue — list overdue loans
  fastify.get('/queue', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const overdueLoans = await fastify.db.loan.findMany({
      where: {
        OR: [
          { lenderId: userId },
          { borrowerId: userId },
        ],
        status: { in: ['ACTIVE', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      include: {
        lender: { select: { id: true, displayName: true, phone: true } },
        borrower: { select: { id: true, displayName: true, phone: true } },
        payments: { orderBy: { paidAt: 'desc' }, take: 1 },
        reminderLogs: { orderBy: { sentAt: 'desc' }, take: 1 },
      },
      orderBy: { dueDate: 'asc' },
    });

    const queue = overdueLoans.map(loan => {
      const daysOverdue = Math.floor((Date.now() - new Date(loan.dueDate).getTime()) / 86400000);
      const escalationStage = loan.escalationStage || 0;
      const lastReminder = loan.reminderLogs[0];
      return {
        id: loan.id,
        amount: Number(loan.amount),
        remainingBalance: Number(loan.remainingBalance),
        borrower: loan.borrower.displayName || loan.borrower.phone,
        dueDate: loan.dueDate,
        daysOverdue,
        escalationStage,
        lastReminderAt: lastReminder?.sentAt || null,
      };
    });

    return reply.send(queue);
  });

  // POST /process — trigger reminder cycle (cron-secured)
  fastify.post('/process', async (request, reply) => {
    const cronSecret = request.headers['x-cron-secret'] as string;
    const expected = process.env.CRON_SECRET || 'dev-cron-secret';
    if (cronSecret !== expected) {
      return reply.status(403).send({ error: 'Invalid cron secret' });
    }

    const overdueLoans = await fastify.db.loan.findMany({
      where: {
        status: { in: ['ACTIVE', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      include: {
        lender: { select: { id: true, displayName: true } },
        borrower: { select: { id: true, displayName: true, phone: true } },
        reminderLogs: { orderBy: { stage: 'desc' }, take: 1 },
      },
    });

    let sent = 0;
    let skipped = 0;

    for (const loan of overdueLoans) {
      const daysOverdue = Math.floor((Date.now() - new Date(loan.dueDate).getTime()) / 86400000);
      const currentStage = Math.min(Math.floor(daysOverdue / 3) + 1, 4); // Stage 1-4 every 3 days
      const lastLog = loan.reminderLogs[0];

      // Skip if already sent this stage
      if (lastLog && lastLog.stage >= currentStage) {
        skipped++;
        continue;
      }

      const stageMessages: Record<number, string> = {
        1: `Rappel amical : le prêt de ${loan.amount} FCFA à ${loan.borrower.displayName || loan.borrower.phone} est dû depuis ${daysOverdue} jours.`,
        2: `Rappel : le délai de remboursement de ${loan.amount} FCFA est dépassé. Merci de régulariser.`,
        3: `😅 ${loan.borrower.displayName || 'Ton ami(e)'} te doit encore ${loan.remainingBalance} FCFA... Ça fait ${daysOverdue} jours !`,
        4: `⚠️ Litige potentiel : le prêt de ${loan.amount} FCFA est impayé depuis ${daysOverdue} jours. Action requise.`,
      };

      await fastify.db.reminderLog.create({
        data: {
          loanId: loan.id,
          sentById: loan.lenderId,
          stage: currentStage,
          channel: 'IN_APP',
          sentAt: new Date(),
        },
      });

      // Update escalation stage on loan
      await fastify.db.loan.update({
        where: { id: loan.id },
        data: { escalationStage: currentStage, status: 'OVERDUE' },
      });

      sent++;
    }

    return reply.send({ processed: overdueLoans.length, sent, skipped });
  });
}