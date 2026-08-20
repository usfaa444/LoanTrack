Build ALL the backend APIs for LoanTrack at packages/api/src. ONLY backend, NO mobile code.

Implementation plan is at _bmad/planning-artifacts/data-collection-api-plan.md. The Prisma schema has been updated with new models (Dispute, Badge, UserBadge, plus new fields on User and Loan). Prisma client is regenerated.

BUILD THESE ROUTES (create each file, do not modify existing files except where specified):

=== FILE 1: packages/api/src/routes/analytics/index.ts ===
Register under /v1/analytics prefix. Endpoints:
- GET /purposes - aggregate loans by purposeCode, return count and totalAmount per purpose
- GET /regions - aggregate loans by user region/city using a join, return count+amount per region
- GET /wallets - count users by preferredWallet
- GET /seasonal - group loans by month (createdAt), return count+totalAmount per month
All GET endpoints, no auth needed.

=== FILE 2: packages/api/src/routes/disputes/index.ts ===
Register under /v1/disputes prefix. All require auth (onRequest: fastify.authenticate).
- POST / - create dispute. Body: loanId, reason. Check user is lender or borrower of loan.
- GET / - list disputes raised by user
- PATCH /:id - update status or resolution
User ID from (request.user as any).id. Use fastify.db for Prisma.

=== FILE 3: packages/api/src/routes/score/index.ts ===
Register under /v1/score prefix.
- GET /me - calculate trust score (auth required)
Score algorithm: fetch user's loans, calculate onTimeRate, totalLoans, defaultRate, avgLoanAmount, streakDays.
base 500 + (onTimeRate*300) + min(loanCount*5,100) - (defaultRate*200) + min(avgLoanAmount/1000,50) + min(streakDays*2,50). Clamp to 0-1000.
Return: { score, breakdown: { onTimeRate, totalLoans, defaultRate, avgLoanAmount, streakDays } }

=== FILE 4: packages/api/src/routes/badges/index.ts ===
Register under /v1/badges prefix.
- GET / - list all Badge definitions (no auth)
- GET /me - list user's badges (auth, join UserBadge+Badge)

=== FILE 5: packages/api/src/routes/streaks/index.ts ===
Register under /v1/streaks prefix.
- GET /me - get user's LoanFreeStreak record (auth). Return currentStreak and longestStreak.

=== FILE 6: packages/api/src/routes/users/index.ts ===
Register under /v1/users prefix.
- GET /me - return user profile with id, phone, email, displayName, region, city, preferredWallet, defaultCurrency (auth)
- PATCH /me - update region, city, preferredWallet (auth)

=== UPDATE FILE 7: packages/api/src/routes/loans/payments.ts ===
Add paymentMethod field support. When recording a payment via POST, ensure the method field from PaymentMethod enum is properly recorded (already in schema, just ensure it passes through).

=== UPDATE FILE 8: packages/api/src/routes/index.ts ===
Register new routes. Add these imports and registrations:
import analyticsRoutes from './analytics/index'
import disputeRoutes from './disputes/index'
import scoreRoutes from './score/index'
import badgeRoutes from './badges/index'
import streakRoutes from './streaks/index'
import userRoutes from './users/index'
fastify.register(analyticsRoutes, { prefix: '/v1/analytics' })
fastify.register(disputeRoutes, { prefix: '/v1/disputes' })
fastify.register(scoreRoutes, { prefix: '/v1/score' })
fastify.register(badgeRoutes, { prefix: '/v1/badges' })
fastify.register(streakRoutes, { prefix: '/v1/streaks' })
fastify.register(userRoutes, { prefix: '/v1/users' })

IMPORTANT NOTES:
- Use Prisma model names exactly as in schema.prisma (Loan, Payment, User, Dispute, Badge, UserBadge, LoanFreeStreak)
- All auth routes use: onRequest: fastify.authenticate
- Get userId via: (request.user as any).id
- Use fastify.db for PrismaClient
- Analytics endpoints DON'T require auth
- For Dispute creation, verify user is loan.lenderId or loan.borrowerId before creating
- Score uses User's own loans. onTimeRate = paidOnTimeLoans / totalPaidLoans. defaultRate = defaultedCount / totalLoans.
- Streaks use LoanFreeStreak table which has userId, currentStreak, longestStreak fields
- Keep all routes as concise, working TypeScript — no TODOs, no placeholders