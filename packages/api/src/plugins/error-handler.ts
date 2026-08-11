import fp from 'fastify-plugin';

// Error handler plugin
export default fp(async (app) => {
  app.setErrorHandler((error: any, request: any, reply: any) => {
    // Log the error
    app.log.error(error);
    
    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: 'Validation Error',
        details: error.validation
      });
    }
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
    
    // Handle rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded'
      });
    }
    
    // Default error response
    reply.status(error.statusCode || 500).send({
      success: false,
      error: error.name || 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : error.message
    });
  });
});