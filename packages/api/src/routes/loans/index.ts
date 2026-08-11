import { FastifyInstance } from 'fastify';
import { createLoan, getLoan, updateLoan, deleteLoan, listLoans, transitionLoanStatus } from '../../services/loan.service';
import { loanCreateSchema, loanUpdateSchema } from '../../schemas/base.schema';

export default async function routes(fastify: FastifyInstance) {
  // POST /v1/loans - Create a new loan
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/',
    {
      schema: {
        description: 'Create a new loan',
        tags: ['loans'],
        body: loanCreateSchema,
        response: {
          201: Type.Object({
            id: Type.String(),
            lenderId: Type.String(),
            borrowerId: Type.String(),
            amount: Type.Number(),
            remainingBalance: Type.Number(),
            currency: Type.String(),
            purpose: Type.String(),
            interestRate: Type.Number(),
            status: Type.String(),
            dueDate: Type.String(),
            createdAt: Type.String(),
            updatedAt: Type.String()
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
        const loanData = request.body;
        
        // User must be either lender or borrower
        if (userId !== loanData.lenderId && userId !== loanData.borrowerId) {
          return reply.status(403).send({
            error: 'User must be either lender or borrower'
          });
        }
        
        const loan = await createLoan(fastify, loanData, userId);
        
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
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/:id',
    {
      schema: {
        description: 'Get a specific loan',
        tags: ['loans'],
        params: Type.Object({
          id: Type.String()
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            lenderId: Type.String(),
            borrowerId: Type.String(),
            amount: Type.Number(),
            remainingBalance: Type.Number(),
            currency: Type.String(),
            purpose: Type.String(),
            interestRate: Type.Number(),
            status: Type.String(),
            dueDate: Type.String(),
            createdAt: Type.String(),
            updatedAt: Type.String()
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
        
        const loan = await getLoan(fastify, id, userId);
        
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
  fastify.withTypeProvider<TypeBoxTypeProvider>().put(
    '/:id',
    {
      schema: {
        description: 'Update a loan',
        tags: ['loans'],
        params: Type.Object({
          id: Type.String()
        }),
        body: loanUpdateSchema,
        response: {
          200: Type.Object({
            id: Type.String(),
            lenderId: Type.String(),
            borrowerId: Type.String(),
            amount: Type.Number(),
            remainingBalance: Type.Number(),
            currency: Type.String(),
            purpose: Type.String(),
            interestRate: Type.Number(),
            status: Type.String(),
            dueDate: Type.String(),
            createdAt: Type.String(),
            updatedAt: Type.String()
          }),
          400: Type.Object({
            error: Type.String()
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
        const updates = request.body;
        
        const loan = await updateLoan(fastify, id, updates, userId);
        
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
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/:id',
    {
      schema: {
        description: 'Delete a loan',
        tags: ['loans'],
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
        
        await deleteLoan(fastify, id, userId);
        
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
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        description: 'List loans with filters',
        tags: ['loans'],
        querystring: Type.Object({
          status: Type.Optional(Type.String()),
          asLender: Type.Optional(Type.Boolean()),
          asBorrower: Type.Optional(Type.Boolean())
        }),
        response: {
          200: Type.Array(Type.Object({
            id: Type.String(),
            lenderId: Type.String(),
            borrowerId: Type.String(),
            amount: Type.Number(),
            remainingBalance: Type.Number(),
            currency: Type.String(),
            purpose: Type.String(),
            interestRate: Type.Number(),
            status: Type.String(),
            dueDate: Type.String(),
            createdAt: Type.String(),
            updatedAt: Type.String()
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
        const { status, asLender, asBorrower } = request.query;
        
        const filters: any = {};
        if (status) filters.status = status;
        if (asLender) filters.asLender = asLender;
        if (asBorrower) filters.asBorrower = asBorrower;
        
        const loans = await listLoans(fastify, userId, filters);
        
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