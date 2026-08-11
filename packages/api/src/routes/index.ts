import { FastifyInstance } from 'fastify';

// Register all routes
export default async function routes(app: FastifyInstance) {
  // Health check route
  app.get('/health', {
    schema: {
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' }
          }
        }
      }
    }
  }, async () => {
    return { status: 'ok' };
  });
}