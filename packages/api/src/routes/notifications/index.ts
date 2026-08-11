import { FastifyInstance } from 'fastify';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../../services/notification.service';
import { PrismaClient } from '@prisma/client';

export default async function routes(fastify: FastifyInstance) {
  // GET /v1/notifications - List notifications
  fastify.get(
    '/',
    {
      schema: {
        description: 'List notifications',
        tags: ['notifications'],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number' },
            offset: { type: 'number' }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                type: { type: 'string' },
                title: { type: 'string' },
                body: { type: 'string' },
                data: { },
                isRead: { type: 'boolean' },
                sentAt: { type: 'string' },
                readAt: { type: 'string' },
                channel: { type: 'string' },
                externalId: { type: 'string' }
              }
            }
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        const { limit = 20, offset = 0 } = request.query as { limit?: number; offset?: number };
        
        const notifications = await listNotifications(fastify.db as unknown as PrismaClient, userId, limit, offset);
        
        return notifications;
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
  
  // POST /v1/notifications/:id/read - Mark notification as read
  fastify.post(
    '/:id/read',
    {
      schema: {
        description: 'Mark notification as read',
        tags: ['notifications'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' }
            }
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        const { id } = request.params as { id: string };
        
        await markNotificationRead(fastify.db as unknown as PrismaClient, id, userId);
        
        return { success: true };
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({
            error: 'Notification not found'
          });
        }
        
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
  
  // POST /v1/notifications/read-all - Mark all notifications as read
  fastify.post(
    '/read-all',
    {
      schema: {
        description: 'Mark all notifications as read',
        tags: ['notifications'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              count: { type: 'number' }
            }
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        
        const count = await markAllNotificationsRead(fastify.db as unknown as PrismaClient, userId);
        
        return {
          success: true,
          count
        };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
}