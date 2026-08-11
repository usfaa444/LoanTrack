import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/devices/register - Register FCM token
  fastify.post(
    '/register',
    {
      schema: {
        description: 'Register FCM device token',
        tags: ['devices'],
        body: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            platform: { type: 'string', enum: ['ios', 'android'] },
            deviceName: { type: 'string' }
          },
          required: ['token', 'platform']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
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
        const { token, platform, deviceName } = request.body as { token: string; platform: 'ios' | 'android'; deviceName?: string };
        
        // Upsert device token
        await (fastify.db as unknown as PrismaClient).deviceToken.upsert({
          where: {
            userId_token: {
              userId: userId,
              token: token
            }
          },
          update: {
            platform: platform,
            deviceName: deviceName,
            lastSeenAt: new Date()
          },
          create: {
            userId: userId,
            token: token,
            platform: platform,
            deviceName: deviceName,
            createdAt: new Date(),
            lastSeenAt: new Date()
          }
        });
        
        return { success: true };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
  
  // POST /v1/devices/unregister - Unregister FCM token
  fastify.post(
    '/unregister',
    {
      schema: {
        description: 'Unregister FCM device token',
        tags: ['devices'],
        body: {
          type: 'object',
          properties: {
            token: { type: 'string' }
          },
          required: ['token']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
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
        const { token } = request.body as { token: string };
        
        // Delete device token
        await (fastify.db as unknown as PrismaClient).deviceToken.delete({
          where: {
            userId_token: {
              userId: userId,
              token: token
            }
          }
        });
        
        return { success: true };
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
}