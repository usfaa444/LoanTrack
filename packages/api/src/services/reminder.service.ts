import { FastifyInstance } from 'fastify';

/**
 * Get reminder ladder configuration for a loan
 * @param app Fastify instance
 * @param loanId Loan ID
 * @returns Promise resolving to reminder template or null
 */
export async function getReminderLadder(app: FastifyInstance, loanId: string): Promise<any | null> {
  const template = await app.db.reminderTemplate.findUnique({
    where: {
      loanId: loanId
    },
    include: {
      stages: {
        orderBy: {
          level: 'asc'
        }
      }
    }
  });
  
  return template;
}

/**
 * Update reminder ladder configuration for a loan
 * @param app Fastify instance
 * @param loanId Loan ID
 * @param stages Array of reminder stages
 * @returns Promise resolving to updated reminder template
 */
export async function updateReminderLadder(
  app: FastifyInstance,
  loanId: string,
  stages: any[]
): Promise<any> {
  // First, get or create the template
  let template = await app.db.reminderTemplate.findUnique({
    where: {
      loanId: loanId
    }
  });
  
  if (!template) {
    template = await app.db.reminderTemplate.create({
      data: {
        loanId: loanId,
        isActive: true
      }
    });
  }
  
  // Delete existing stages
  await app.db.reminderStage.deleteMany({
    where: {
      templateId: template.id
    }
  });
  
  // Create new stages
  const stagePromises = stages.map((stage, index) => {
    return app.db.reminderStage.create({
      data: {
        templateId: template.id,
        level: index + 1,
        delayDays: stage.delayDays,
        tone: stage.tone,
        template: stage.template,
        channel: stage.channel,
        includeMeme: stage.includeMeme || false
      }
    });
  });
  
  const createdStages = await Promise.all(stagePromises);
  
  // Return updated template with stages
  return {
    ...template,
    stages: createdStages
  };
}

/**
 * Compute current reminder stage for a loan
 * @param app Fastify instance
 * @param loan Loan object
 * @returns Promise resolving to current stage or null
 */
export async function computeCurrentStage(app: FastifyInstance, loan: any): Promise<any | null> {
  // Get reminder template
  const template = await getReminderLadder(app, loan.id);
  
  if (!template || !template.isActive) {
    return null;
  }
  
  // Calculate days overdue
  const dueDate = new Date(loan.dueDate);
  const now = new Date();
  const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Find appropriate stage
  let currentStage = null;
  
  for (const stage of template.stages.sort((a, b) => a.level - b.level)) {
    // If delayDays is negative, it's before due date
    // If delayDays is positive, it's after due date
    if (stage.delayDays <= daysOverdue) {
      currentStage = stage;
    } else {
      break;
    }
  }
  
  return currentStage;
}

/**
 * Manually send reminder for a loan
 * @param app Fastify instance
 * @param loanId Loan ID
 * @param stageLevel Stage level to send
 * @returns Promise resolving to reminder log
 */
export async function sendManualReminder(
  app: FastifyInstance,
  loanId: string,
  stageLevel: number
): Promise<any> {
  // Get loan
  const loan = await app.db.loan.findUnique({
    where: {
      id: loanId
    },
    include: {
      borrower: true
    }
  });
  
  if (!loan) {
    throw new Error('Loan not found');
  }
  
  // Get reminder template
  const template = await getReminderLadder(app, loanId);
  
  if (!template || !template.isActive) {
    throw new Error('Reminder template not found or inactive');
  }
  
  // Get specific stage
  const stage = template.stages.find((s: any) => s.level === stageLevel);
  
  if (!stage) {
    throw new Error('Reminder stage not found');
  }
  
  // Log reminder
  const reminderLog = await app.db.reminderLog.create({
    data: {
      loanId: loanId,
      stage: stage.level,
      channel: stage.channel,
      sentAt: new Date()
    }
  });
  
  return reminderLog;
}