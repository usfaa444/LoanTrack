import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../../services/notification.service';

export default async function routes(fastify: FastifyInstance) {
  // GET /v1/notifications - List notifications
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        description: 'List notifications',
        tags: ['notifications'],
        querystring: Type.Object({
          limit: Type.Optional(Type.Number()),
          offset: Type.Optional(Type.Number())
        }),
        response: {
          200: Type.Array(Type.Object({
            id: Type.String(),
            userId: Type.String(),
            type: Type.String(),
            title: Type.String(),
            body: Type.String(),
            data: Type.Optional(Type.Any()),
            isRead: Type.Boolean(),
            sentAt: Type.String(),
            readAt: Type.Optional(Type.String()),
            channel: Type.String(),
            externalId: Type.Optional(Type.String())
          })),
          401: Type.Object({
            error: Type.String()
          })
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        const { limit = 20, offset = 0 } = request.query;
        
        const notifications = await listNotifications(fastify, userId, limit, offset);
        
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
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/:id/read',
    {
      schema: {
        description: 'Mark notification as read',
        tags: ['notifications'],
        params: Type.Object({
          id: Type.String()
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean()
          }),
          401: Type.Object({
            error: Type.String()
          }),
          404: Type.Object({
            error: Type.String()
          })
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        const { id } = request.params;
        
        await markNotificationRead(fastify, id, userId);
        
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
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/read-all',
    {
      schema: {
        description: 'Mark all notifications as read',
        tags: ['notifications'],
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            count: Type.Number()
          }),
          401: Type.Object({
            error: Type.String()
          })
        }
      },
      onRequest: fastify.authenticate
    },
    async (request, reply) => {
      try {
        const userId = (request.user as any).id;
        
        const count = await markAllNotificationsRead(fastify, userId);
        
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