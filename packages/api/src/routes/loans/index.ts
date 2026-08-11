import { FastifyInstance } from 'fastify';
import { createLoan, getLoan, updateLoan, deleteLoan, listLoans, transitionLoanStatus } from '../../services/loan.service';
import { loanCreateSchema, loanUpdateSchema } from '../../schemas/base.schema';
import { PrismaClient } from '@prisma/client';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/loans - Create a new loan
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new loan',
        tags: ['loans'],
        body: loanCreateSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              lenderId: { type: 'string' },
              borrowerId: { type: 'string' },
              amount: { type: 'number' },
              remainingBalance: { type: 'number' },
              currency: { type: 'string' },
              purpose: { type: 'string' },
              interestRate: { type: 'number' },
              status: { type: 'string' },
              dueDate: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
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
          },
          403: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
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
        const loanData = request.body as any;
        
        // User must be either lender or borrower
        if (userId !== loanData.lenderId && userId !== loanData.borrowerId) {
          return reply.status(403).send({
            error: 'User must be either lender or borrower'
          });
        }
        
        const loan = await createLoan(fastify.db, loanData, userId);
        
        return reply.status(201).send(loan);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
  
  // GET /v1/loans/:id - Get a specific loan
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get a specific loan',
        tags: ['loans'],
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
              id: { type: 'string' },
              lenderId: { type: 'string' },
              borrowerId: { type: 'string' },
              amount: { type: 'number' },
              remainingBalance: { type: 'number' },
              currency: { type: 'string' },
              purpose: { type: 'string' },
              interestRate: { type: 'number' },
              status: { type: 'string' },
              dueDate: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
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
          },
          500: {
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
        
        const loan = await getLoan(fastify.db, id, userId);
        
        if (!loan) {
          return reply.status(404).send({
            error: 'Loan not found'
          });
        }
        
        return loan;
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
  
  // PUT /v1/loans/:id - Update a loan
  fastify.put(
    '/:id',
    {
      schema: {
        description: 'Update a loan',
        tags: ['loans'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        body: loanUpdateSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              lenderId: { type: 'string' },
              borrowerId: { type: 'string' },
              amount: { type: 'number' },
              remainingBalance: { type: 'number' },
              currency: { type: 'string' },
              purpose: { type: 'string' },
              interestRate: { type: 'number' },
              status: { type: 'string' },
              dueDate: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
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
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
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
        const updates = request.body as any;
        
        const loan = await updateLoan(fastify.db, id, updates, userId);
        
        return loan;
      } catch (error: any) {
        if (error.message === 'Loan not found or access denied') {
          return reply.status(404).send({
            error: 'Loan not found'
          });
        }
        
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
  
  // DELETE /v1/loans/:id - Delete a loan (soft delete)
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete a loan',
        tags: ['loans'],
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
          },
          500: {
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
        
        await deleteLoan(fastify.db, id, userId);
        
        return { success: true };
      } catch (error: any) {
        if (error.message === 'Loan not found or access denied') {
          return reply.status(404).send({
            error: 'Loan not found'
          });
        }
        
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
  
  // GET /v1/loans - List loans with filters
  fastify.get(
    '/',
    {
      schema: {
        description: 'List loans with filters',
        tags: ['loans'],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            asLender: { type: 'boolean' },
            asBorrower: { type: 'boolean' }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                lenderId: { type: 'string' },
                borrowerId: { type: 'string' },
                amount: { type: 'number' },
                remainingBalance: { type: 'number' },
                currency: { type: 'string' },
                purpose: { type: 'string' },
                interestRate: { type: 'number' },
                status: { type: 'string' },
                dueDate: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
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
        const { status, asLender, asBorrower } = request.query as { status?: string; asLender?: boolean; asBorrower?: boolean };
        
        const filters: any = {};
        if (status) filters.status = status;
        if (asLender) filters.asLender = asLender;
        if (asBorrower) filters.asBorrower = asBorrower;
        
        const loans = await listLoans(fastify.db, userId, filters);
        
        return loans;
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
}