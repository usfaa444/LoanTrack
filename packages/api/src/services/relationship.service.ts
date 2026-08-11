import { FastifyInstance } from 'fastify';

/**
 * Get relationship data between two users
 * @param app Fastify instance
 * @param sourceUserId Source user ID
 * @param targetUserId Target user ID
 * @returns Promise resolving to relationship edge or null
 */
export async function getRelationship(
  app: FastifyInstance,
  sourceUserId: string,
  targetUserId: string
): Promise<any | null> {
  const relationship = await app.db.relationshipEdge.findUnique({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId: sourceUserId,
        targetUserId: targetUserId
      }
    }
  });
  
  return relationship;
}

/**
 * Update relationship data between two users
 * @param app Fastify instance
 * @param sourceUserId Source user ID
 * @param targetUserId Target user ID
 * @param isLending Whether source user is lending to target
 * @param amount Amount of transaction
 * @returns Promise resolving to updated relationship edge
 */
export async function updateRelationship(
  app: FastifyInstance,
  sourceUserId: string,
  targetUserId: string,
  isLending: boolean,
  amount: number
): Promise<any> {
  // Determine whether to increment lent or borrowed
  const updateData = isLending
    ? {
        totalLent: {
          increment: amount
        },
        loanCount: {
          increment: 1
        }
      }
    : {
        totalBorrowed: {
          increment: amount
        },
        loanCount: {
          increment: 1
        }
      };
  
  // Update or create relationship edge
  const relationship = await app.db.relationshipEdge.upsert({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId: sourceUserId,
        targetUserId: targetUserId
      }
    },
    update: {
      ...updateData,
      lastInteractionAt: new Date()
    },
    create: {
      sourceUserId: sourceUserId,
      targetUserId: targetUserId,
      totalLent: isLending ? amount : 0,
      totalBorrowed: isLending ? 0 : amount,
      loanCount: 1,
      lastInteractionAt: new Date()
    }
  });
  
  return relationship;
}

/**
 * Get relationship network for a user
 * @param app Fastify instance
 * @param userId User ID
 * @returns Promise resolving to array of relationships
 */
export async function getRelationshipNetwork(
  app: FastifyInstance,
  userId: string
): Promise<any[]> {
  const relationships = await app.db.relationshipEdge.findMany({
    where: {
      OR: [
        { sourceUserId: userId },
        { targetUserId: userId }
      ]
    },
    include: {
      sourceUser: {
        select: {
          id: true,
          phone: true,
          displayName: true
        }
      },
      targetUser: {
        select: {
          id: true,
          phone: true,
          displayName: true
        }
      }
    }
  });
  
  return relationships;
}