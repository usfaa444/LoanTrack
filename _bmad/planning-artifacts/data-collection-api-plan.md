# LoanTrack — Data Collection API Implementation Plan

> Goal: Build ALL backend APIs needed to collect the 8 data types from our monetization strategy
> Scope: Backend only (Fastify + Prisma + PostgreSQL)
> Mobile: Not included (switching to CMP later)

---

## Data Type → API Mapping

### 1. Repayment Behavior & Reliability (CORE — partial exists)
What exists: Loan CRUD (POST/GET/PATCH/DELETE /v1/loans)
What needs building:
- [ ] Payment recording with timestamps + partial amounts
- [ ] Repayment velocity calculation (how fast vs agreed schedule)
- [ ] Late-payment detection (scheduled date vs actual date)
- [ ] On-time payment rate per user

### 2. Borrowing Purpose & Life Events
What exists: `purpose` field as string on Loan model
What needs building:
- [ ] Structured purpose taxonomy (school_fees, medical, business_stock, agriculture, ceremony, rent, emergency, personal, other)
- [ ] Purpose aggregation API — what people borrow for, by region/time
- [ ] Life-event tagging on loans

### 3. Social / Trust Graph
What exists: LenderId/BorrowerId on Loan model
What needs building:
- [ ] User-to-user relationship model (friends, family, business, community)
- [ ] Relationship strength scoring (number of loans, repayment quality)
- [ ] Shared borrowing circle detection
- [ ] Group/lending circle model

### 4. Cash Flow & Timing
What exists: Nothing
What needs building:
- [ ] Payment-method tracking (cash, orange_money, moov, wave, bank_transfer)
- [ ] Due-date calendar aggregation
- [ ] Seasonal-spike detection

### 5. Trust Score Progression
What exists: Nothing
What needs building:
- [ ] Trust score calculation engine (0-1000)
- [ ] Score factors: on-time%, loan count, amount range, streak length
- [ ] Streak tracking (loan-free days, consecutive on-time payments)
- [ ] Milestone/badge system

### 6. Geographic & Demographic Density
What exists: Country picker on mobile
What needs building:
- [ ] Region/city fields on user
- [ ] Anonymous aggregate analytics: loans by region, avg amount by region, purpose by region

### 7. Dispute & Conflict Resolution
What exists: Nothing
What needs building:
- [ ] Dispute model (loanId, raised by, reason, status)
- [ ] Digital IOU generation (PDF with signatures)
- [ ] Resolution workflow (open → mediated → resolved/rejected)

### 8. Mobile Money Usage Patterns
What exists: Nothing
What needs building:
- [ ] Wallet preference on user profile
- [ ] Payment-method logging on payments
- [ ] Aggregate: which wallet most used, by region, by amount

---

## Implementation Order (by dependency)

### Phase 1 — Schema Changes (Prisma)
1. Add purpose enum/reference table
2. Add paymentMethod to Payment model
3. Add region/city to User
4. Add Dispute model
5. Add RelationshipEdge model (if not exists)
6. Add Streak model
7. Add Badge model

### Phase 2 — Core APIs
1. Payment recording with full metadata
2. Purpose taxonomy + aggregation
3. Region/city user updates + analytics
4. Payment-method tracking

### Phase 3 — Scoring & Gamification
1. Trust score engine
2. Streak tracking
3. Badge system

### Phase 4 — Social & Advanced
1. Relationship graph
2. Dispute workflow
3. Digital IOU

## New Prisma Models Needed

```prisma
model PurposeTag {
  id    String @id @default(uuid()) @db.Uuid
  code  String @unique  // school_fees, medical, business_stock, etc.
  labelFr String        // French display name
}

model Dispute {
  id        String @id @default(uuid()) @db.Uuid
  loanId    String @db.Uuid
  raisedBy  String @db.Uuid // userId
  reason    String
  status    String @default("open") // open, mediated, resolved, rejected
  createdAt DateTime @default(now())
  resolvedAt DateTime?
  resolution String?
  
  loan Loan @relation(fields: [loanId], references: [id])
  raiser User @relation(fields: [raisedBy], references: [id])
}

model RelationshipEdge {
  id          String @id @default(uuid()) @db.Uuid
  sourceId    String @db.Uuid
  targetId    String @db.Uuid
  type        String // friend, family, business, community
  strength    Int @default(0) // 0-100
  loanCount   Int @default(0)
  createdAt   DateTime @default(now())
  
  source User @relation("SourceEdges", fields: [sourceId], references: [id])
  target User @relation("TargetEdges", fields: [targetId], references: [id])
  
  @@unique([sourceId, targetId])
}

model Streak {
  id        String @id @default(uuid()) @db.Uuid
  userId    String @db.Uuid
  type      String // on_time_payments, loan_free_days
  current   Int @default(0)
  longest   Int @default(0)
  startedAt DateTime @default(now())
  endedAt   DateTime?
  
  user User @relation(fields: [userId], references: [id])
  
  @@unique([userId, type])
}

model Badge {
  id        String @id @default(uuid()) @db.Uuid
  code      String @unique
  labelFr   String
  icon      String
  tier      Int @default(1) // 1=bronze, 2=silver, 3=gold
}

model UserBadge {
  id        String @id @default(uuid()) @db.Uuid
  userId    String @db.Uuid
  badgeId   String @db.Uuid
  awardedAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  badge Badge @relation(fields: [badgeId], references: [id])
  
  @@unique([userId, badgeId])
}
```

## User Model Additions
- `region` String? @db.VarChar(100)
- `city` String? @db.VarChar(100)
- `preferredWallet` String? (orange_money, moov, wave, cash, bank)

## Payment Model Additions
- `paymentMethod` String (cash, orange_money, moov, wave, bank_transfer)

## Loan Model Additions
- `dueDate` DateTime?
- `purposeCode` String? // links to PurposeTag.code

---

## New API Routes

### /v1/payments
- POST / — record payment with method + amount + timestamp
- GET / — list payments by loan

### /v1/analytics
- GET /purposes — aggregate borrowing purposes by time/region
- GET /regions — aggregate lending activity by region
- GET /wallets — mobile money usage patterns
- GET /seasonal — seasonal borrowing trends

### /v1/score
- GET /me — get own trust score + breakdown
- GET /:userId — get another user's score (if public)

### /v1/streaks
- GET /me — get current streaks

### /v1/badges
- GET /me — list earned badges

### /v1/disputes
- POST / — raise dispute on a loan
- GET / — list disputes for user
- PATCH /:id — update/resolve dispute

### /v1/relationships
- GET / — list relationships
- POST / — create/strengthen relationship
- GET /graph — relationship heatmap data

### /v1/users/me (extend existing)
- PATCH / — allow updating region, city, preferredWallet

### /v1/loans (extend existing)
- Add purposeCode to create/update
- Add dueDate to create/update

---

## Trust Score Algorithm

```typescript
function calculateTrustScore(user: UserStats): number {
  let score = 500; // baseline
  
  score += Math.min(onTimeRate * 30, 300); // up to 300pts for on-time%
  score += Math.min(totalLoans * 5, 100); // up to 100pts for volume
  score -= Math.min(defaultRate * 40, 200); // -200pts for defaults
  score += Math.min(avgLoanAmount / 1000, 50); // up to 50pts for amounts
  score += Math.min(currentStreak * 2, 50); // up to 50pts for streaks
  
  return Math.max(0, Math.min(1000, Math.round(score)));
}
```

## Status Summary

| Data Type | Existing | To Build | Priority |
|-----------|---------|----------|----------|
| Repayment behavior | Loan CRUD only | Payment tracking + velocity | 🥇 P1 |
| Purpose & life events | String field | Taxonomy + aggregation | 🥇 P1 |
| Social/trust graph | Lender/borrower IDs | Relationship model + heatmap | 🥈 P2 |
| Cash flow & timing | Nothing | Payment methods + calendar | 🥇 P1 |
| Trust score | Nothing | Full scoring engine | 🥈 P2 |
| Geographic | Nothing | Region + analytics | 🥇 P1 |
| Dispute resolution | Nothing | Full dispute workflow | 🥉 P3 |
| Mobile money patterns | Nothing | Wallet tracking + analytics | 🥇 P1 |