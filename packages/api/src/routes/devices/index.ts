import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/devices/register - Register FCM token
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/register',
    {
      schema: {
        description: 'Register FCM device token',
        tags: ['devices'],
        body: Type.Object({
          token: Type.String(),
          platform: Type.Union([Type.Literal('ios'), Type.Literal('android')]),
          deviceName: Type.Optional(Type.String())
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean()
          }),
          400: Type.Object({
            error: Type.String()
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
        const { token, platform, deviceName } = request.body;
        
        // Upsert device token
        await fastify.db.deviceToken.upsert({
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
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/unregister',
    {
      schema: {
        description: 'Unregister FCM device token',
        tags: ['devices'],
        body: Type.Object({
          token: Type.String()
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean()
          }),
          400: Type.Object({
            error: Type.String()
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
        const { token } = request.body;
        
        // Delete device token
        await fastify.db.deviceToken.delete({
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