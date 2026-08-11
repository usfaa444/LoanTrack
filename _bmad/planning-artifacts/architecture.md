# Architecture Document — LoanTrack

**Document Version:** 1.0  
**Date:** 2026-08-11  
**Status:** Draft  
**Author:** Engineering Team

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         Expo (React Native) Mobile App                        │   │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌────────────────────────┐  │   │
│  │  │ TanStack │  │ NativeWind│  │ React Native │  │  WatermelonDB /        │  │   │
│  │  │ Query    │  │ (Tailwind)│  │ Reanimated   │  │  expo-sqlite (offline) │  │   │
│  │  └──────────┘  └───────────┘  └──────────────┘  └────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Offline Sync Queue ──▶ Syncs mutations when connectivity restored   │   │   │
│  │  └──────────────────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                    HTTPS (TLS 1.3)        │        FCM Push
                                          │        Twilio SMS
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   API LAYER                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                     Fastify API Server (Fly.io — auto-scaled)                 │   │
│  │  ┌──────────┐  ┌────────────┐  ┌─────────────┐  ┌───────────────────────┐   │   │
│  │  │ Auth     │  │ Loan       │  │ Reminder     │  │ Notification          │   │   │
│  │  │ Router   │  │ Router     │  │ Router      │  │ Router                │   │   │
│  │  └──────────┘  └────────────┘  └─────────────┘  └───────────────────────┘   │   │
│  │  ┌──────────┐  ┌────────────┐  ┌─────────────┐  ┌───────────────────────┐   │   │
│  │  │ Trust    │  │ IOU        │  │ Streak       │  │ Relationship          │   │   │
│  │  │ Router   │  │ Router     │  │ Router      │  │ Router                │   │   │
│  │  └──────────┘  └────────────┘  └─────────────┘  └───────────────────────┘   │   │
│  │                                                                              │   │
│  │  Middleware: Zod Validation │ JWT Auth │ Rate Limiting │ Request Logging     │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                    │                       │                       │
                    ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                SERVICE / DATA LAYER                                  │
│                                                                                     │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────────────┐    │
│  │   Supabase       │   │   Upstash Redis  │   │   BullMQ (Redis-backed)      │    │
│  │                  │   │                  │   │                              │    │
│  │ ┌──────────────┐ │   │ ┌──────────────┐ │   │  ┌────────────────────────┐ │    │
│  │ │ PostgreSQL   │ │   │ │ Session      │ │   │  │ Reminder Worker        │ │    │
│  │ │ (Primary DB) │ │   │ │ Cache        │ │   │  │  - Sweep overdue loans  │ │    │
│  │ └──────────────┘ │   │ └──────────────┘ │   │  │  - Escalation ladder    │ │    │
│  │ ┌──────────────┐ │   │ ┌──────────────┐ │   │  │  - Send push/SMS        │ │    │
│  │ │ Auth (GoTrue)│ │   │ │ Rate Limiter │ │   │  └────────────────────────┘ │    │
│  │ └──────────────┘ │   │ └──────────────┘ │   │  ┌────────────────────────┐ │    │
│  │ ┌──────────────┐ │   │ ┌──────────────┐ │   │  │ Trust Score Worker     │ │    │
│  │ │ Storage (S3) │ │   │ │ BullMQ Queue │ │   │  │  - Nightly recalculation│ │    │
│  │ └──────────────┘ │   │ └──────────────┘ │   │  │  - Real-time on events  │ │    │
│  │ ┌──────────────┐ │   └──────────────────┘   │  └────────────────────────┘ │    │
│  │ │ Realtime     │ │                          │  ┌────────────────────────┐ │    │
│  │ │ (WebSockets) │ │                          │  │ Streak Worker          │ │    │
│  │ └──────────────┘ │                          │  │  - Daily streak update  │ │    │
│  └──────────────────┘                          │  │  - Milestone detection  │ │    │
│                                                │  └────────────────────────┘ │    │
│  ┌──────────────────┐                          └──────────────────────────────┘    │
│  │ External APIs    │                                                                │
│  │ ┌──────────────┐ │                                                                │
│  │ │ Firebase     │ │                                                                │
│  │ │ Cloud Msg    │ │── Push notifications to devices                                │
│  │ └──────────────┘ │                                                                │
│  │ ┌──────────────┐ │                                                                │
│  │ │ Twilio       │ │                                                                │
│  │ │ Verify + SMS │ │── OTP delivery + SMS reminders                                 │
│  │ └──────────────┘ │                                                                │
│  └──────────────────┘                                                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               CI/CD & OBSERVABILITY                                  │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────────────┐    │
│  │ GitHub Actions   │   │ EAS Build        │   │ Monitoring                   │    │
│  │ - Lint & Test    │   │ - Expo OTA       │   │ - Fly.io Metrics             │    │
│  │ - Deploy API     │   │ - App Store Build│   │ - Sentry (error tracking)    │    │
│  │ - DB Migrations  │   │ - Submit         │   │ - Firebase Crashlytics       │    │
│  └──────────────────┘   └──────────────────┘   │ - PostHog (analytics)        │    │
│                                                 └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Summary

1. **User creates a loan** → Expo app sends POST `/api/loans` → Fastify validates with Zod → Prisma writes to PostgreSQL → Borrower notification queued in BullMQ → Worker sends FCM push + Twilio SMS → NotificationLog written.
2. **Reminder sweep (cron)** → BullMQ repeatable job runs every hour → Queries all overdue ACTIVE loans → Calculates current escalation stage → Queues notification jobs → FCM/Twilio sends → ReminderLog written.
3. **Payment recorded** → PATCH `/api/loans/:id/payments` → Fastify updates loan balance → If fully paid: status → PAID, Trust Score event queued, confetti notification queued.
4. **Offline mutation** → User creates/edits loan offline → Written to local SQLite + sync queue → On reconnect, TanStack Query `onlineManager` triggers → Queued mutations replayed sequentially against API → Conflicts resolved (server timestamp wins).
5. **Trust Score recalculation** → On payment/repayment event OR nightly cron → BullMQ job fetches all TrustScoreEvents for user → Applies formula → Updates TrustScore record.

---

## 2. Technology Stack

| Layer | Technology | Version | Justification |
|---|---|---|---|
| **Mobile Framework** | Expo (React Native) | SDK 52+ | Cross-platform iOS/Android from single codebase. Managed workflow eliminates native build complexity. EAS Build for CI/CD. Largest React Native ecosystem. |
| **Navigation** | Expo Router | v4 | File-based routing like Next.js. Deep linking built-in. Type-safe routes. |
| **State Management** | TanStack Query (React Query) | v5 | Best-in-class server-state caching, background refetching, optimistic updates, offline support with `persistQueryClient`. Handles sync queue natively. |
| **Styling** | NativeWind (Tailwind CSS) | v4 | Utility-first styling with full Tailwind class support in React Native. Consistent design system. Fast iteration. |
| **Animations** | React Native Reanimated | v3 | 60fps animations on UI thread for confetti, graph transitions, celebrations. Required for heatmap interactivity. |
| **Local Database (Offline)** | WatermelonDB + SQLite | v0.27+ | High-performance local DB with lazy loading, sync primitives, and reactive queries. Built on SQLite. Handles 10K+ records smoothly. |
| **API Server** | Fastify | v5 | Fastest Node.js HTTP framework (2x faster than Express). Native TypeScript. Plugin architecture. Schema-based serialization (via `@fastify/type-provider-typebox` or Zod). Built-in validation with `@fastify/type-provider-zod`. |
| **Database ORM** | Prisma | v6+ | Type-safe database access. Auto-generated types from schema. Migration system. Relation queries. Raw SQL escape hatch for analytics. |
| **Database** | PostgreSQL | v16 | Via Supabase managed Postgres. Full-text search, JSONB for flexible data, row-level security, connection pooling via PgBouncer. |
| **Database Host** | Supabase | — | Managed PostgreSQL + Auth (GoTrue) + Storage (S3-compatible) + Realtime (WebSockets) + Edge Functions (optional). Generous free tier. RLS enforcement. |
| **Auth** | Supabase Auth (GoTrue) | — | Phone OTP via Twilio Verify integration. JWT issuance. Row-Level Security policies tied to `auth.uid()`. Session management. |
| **Cache & Queue** | Upstash Redis | — | Serverless Redis with per-request pricing. Used for: BullMQ job queues, session caching, rate limiting counters. No server to manage. |
| **Job Queue** | BullMQ | v5+ | Reliable Redis-backed job processing. Delayed jobs for reminder scheduling. Repeatable jobs for cron sweeps. Job progress tracking. Retry with exponential backoff. |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | — | Universal push delivery to iOS (APNs proxy) and Android. Free. Reliable. Topic-based and device-token-based messaging. |
| **SMS** | Twilio | — | Programmable SMS for OTP delivery (via Supabase Auth) and SMS reminders. Programmable Messaging API for bulk. Verify API for OTP. |
| **PDF Generation** | Puppeteer (server-side) | v23+ | Headless Chrome for rendering HTML → PDF. Used for Digital IOU generation. HTML templates with embedded signatures. |
| **Monorepo** | Turborepo | v2 | Parallel task execution. Shared packages (`@loantrack/types`, `@loantrack/utils`, `@loantrack/prisma`). Caching of build outputs and lint results. |
| **Package Manager** | pnpm | v9+ | Fast, disk-efficient. Strict dependency resolution. Workspaces native support. |
| **Language** | TypeScript | v5.5+ | End-to-end type safety from database (Prisma) → API (Fastify) → Mobile (Expo). Shared types package. |
| **CI/CD** | GitHub Actions | — | Free for public repos. Matrix builds. EAS Build integration. Fly.io deploy via `flyctl`. |
| **App Build** | EAS Build | — | Expo's managed build service. iOS/Android builds in cloud. OTA updates via EAS Update. App store submission via EAS Submit. |
| **Hosting (API)** | Fly.io | — | Edge-close deployment. Auto-scaling. Free tier sufficient for MVP (3 shared VMs). Zero-downtime deploys. Built-in SSL. |
| **Monitoring** | Sentry + Fly.io Metrics | — | Error tracking across API + mobile. Performance tracing. Crash reporting (supplements Crashlytics). |
| **Crash Reporting** | Firebase Crashlytics | — | Mobile crash reporting. Native stack traces. Integrated with FCM project. |
| **Analytics** | PostHog | — | Open-source product analytics. Event tracking, user cohorts, funnel analysis. GDPR-friendly self-host option. |

---

## 3. API Design

> **Base URL:** `https://api.loantrack.app/v1`  
> **Auth Header:** `Authorization: Bearer <jwt>`  
> **Content-Type:** `application/json`

### 3.1 Authentication

#### `POST /auth/otp/send`

Send OTP to phone number.

**Request:**
```json
{
  "phone": "+14155551234"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "sess_abc123",
    "expiresAt": "2026-08-11T14:35:00Z"
  }
}
```

**Errors:** `400` Invalid phone format, `429` Rate limited

---

#### `POST /auth/otp/verify`

Verify OTP and receive JWT.

**Request:**
```json
{
  "phone": "+14155551234",
  "code": "123456",
  "sessionId": "sess_abc123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresAt": "2026-08-11T14:50:00Z",
    "user": {
      "id": "usr_abc123",
      "phone": "+14155551234",
      "displayName": null,
      "avatarUrl": null,
      "defaultCurrency": "USD",
      "isNewUser": true
    }
  }
}
```

**Errors:** `400` Invalid/expired code, `401` Max attempts exceeded

---

#### `POST /auth/refresh`

Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "bmV3IHJlZnJlc2ggdG9r...",
    "expiresAt": "2026-08-11T15:05:00Z"
  }
}
```

**Errors:** `401` Invalid/expired refresh token

---

#### `POST /auth/pin/setup`

Set local PIN (validated against stored bcrypt hash).

**Auth Required:** Yes

**Request:**
```json
{
  "pin": "4829"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "PIN set successfully"
  }
}
```

**Errors:** `400` PIN too short/long (must be 4-6 digits), `409` PIN already set

---

#### `POST /auth/pin/verify`

Verify local PIN (returns a session token for sensitive operations).

**Auth Required:** Yes

**Request:**
```json
{
  "pin": "4829"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pinToken": "pin_tok_xyz789",
    "expiresAt": "2026-08-11T14:20:00Z"
  }
}
```

**Errors:** `401` Invalid PIN, `429` 5 attempts exceeded → account locked for 30 min

---

### 3.2 User Profile

#### `GET /users/me`

Get authenticated user's profile.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "phone": "+14155551234",
    "displayName": "Priya",
    "avatarUrl": "https://storage.loantrack.app/avatars/usr_abc123.jpg",
    "defaultCurrency": "USD",
    "trustScore": 720,
    "trustTier": "TRUSTED",
    "currentStreak": 23,
    "createdAt": "2026-01-15T08:30:00Z"
  }
}
```

---

#### `PATCH /users/me`

Update user profile.

**Auth Required:** Yes

**Request:**
```json
{
  "displayName": "Priya K.",
  "defaultCurrency": "EUR",
  "isTrustScorePublic": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "displayName": "Priya K.",
    "defaultCurrency": "EUR",
    "isTrustScorePublic": true,
    "updatedAt": "2026-08-11T14:30:00Z"
  }
}
```

---

#### `DELETE /users/me`

Delete account (GDPR right to erasure). Requires PIN verification.

**Auth Required:** Yes  
**Headers:** `X-Pin-Token: pin_tok_xyz789`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Account scheduled for deletion. Data will be purged within 30 days.",
    "deletionDate": "2026-09-10T14:30:00Z"
  }
}
```

---

### 3.3 Loans

#### `POST /loans`

Create a new loan.

**Auth Required:** Yes

**Request:**
```json
{
  "borrowerPhone": "+14155559876",
  "amount": 150.00,
  "currency": "USD",
  "purpose": "Dinner at Nobu",
  "dueDate": "2026-09-01T00:00:00Z",
  "interestRate": 0,
  "collateralDescription": null,
  "templateId": null
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "loan_xyz789",
    "lenderId": "usr_abc123",
    "borrowerId": "usr_def456",
    "amount": 150.00,
    "remainingBalance": 150.00,
    "currency": "USD",
    "purpose": "Dinner at Nobu",
    "dueDate": "2026-09-01T00:00:00Z",
    "interestRate": 0,
    "status": "ACTIVE",
    "createdAt": "2026-08-11T14:35:00Z",
    "borrowerAcceptedAt": null,
    "reminderLadder": {
      "stages": [
        { "level": 1, "delayDays": -1, "tone": "FRIENDLY", "template": "Hey {borrower_name}! Just a heads-up about {amount} for {purpose}. No rush!", "channel": "PUSH" },
        { "level": 2, "delayDays": 0, "tone": "POLITE", "template": "Hi {borrower_name}, just a reminder that {amount} is due today for {purpose}. Thanks!", "channel": "PUSH" },
        { "level": 3, "delayDays": 7, "tone": "FIRM", "template": "Hi {borrower_name}, {amount} is now {days_overdue} days overdue. This may affect your Trust Score.", "channel": "BOTH" },
        { "level": 4, "delayDays": 14, "tone": "SERIOUS", "template": "This is a final reminder about {amount} from {days_overdue} days ago.", "channel": "BOTH", "includeMeme": true }
      ],
      "isActive": true
    }
  }
}
```

**Errors:** `400` Invalid data, `404` Borrower phone not found (triggers SMS invite)

---

#### `GET /loans`

List loans with filters.

**Auth Required:** Yes

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `status` | string | `ACTIVE`, `OVERDUE`, `PAID`, `FORGIVEN`, `DISPUTED` (comma-separated) |
| `role` | string | `lender`, `borrower` |
| `search` | string | Search by counterparty name or purpose |
| `sortBy` | string | `dueDate`, `amount`, `createdAt`, `counterpartyName` |
| `sortDir` | string | `asc`, `desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "loan_xyz789",
        "counterparty": {
          "id": "usr_def456",
          "displayName": "Marcus",
          "avatarUrl": "https://storage.loantrack.app/avatars/usr_def456.jpg",
          "trustTier": "RELIABLE"
        },
        "amount": 150.00,
        "remainingBalance": 75.00,
        "currency": "USD",
        "purpose": "Dinner at Nobu",
        "dueDate": "2026-09-01T00:00:00Z",
        "status": "ACTIVE",
        "role": "lender",
        "daysUntilDue": 21,
        "paymentCount": 1,
        "createdAt": "2026-08-11T14:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 42,
      "totalPages": 3
    }
  }
}
```

---

#### `GET /loans/:id`

Get loan detail.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "loan_xyz789",
    "lender": {
      "id": "usr_abc123",
      "displayName": "Priya",
      "avatarUrl": "https://storage.loantrack.app/avatars/usr_abc123.jpg"
    },
    "borrower": {
      "id": "usr_def456",
      "displayName": "Marcus",
      "avatarUrl": "https://storage.loantrack.app/avatars/usr_def456.jpg",
      "phone": "+14155559876"
    },
    "amount": 150.00,
    "remainingBalance": 75.00,
    "currency": "USD",
    "purpose": "Dinner at Nobu",
    "dueDate": "2026-09-01T00:00:00Z",
    "interestRate": 0,
    "collateralDescription": null,
    "status": "ACTIVE",
    "escalationStage": 1,
    "createdAt": "2026-08-11T14:35:00Z",
    "borrowerAcceptedAt": "2026-08-11T15:00:00Z",
    "paidAt": null,
    "forgivenAt": null,
    "payments": [
      {
        "id": "pay_111222",
        "amount": 75.00,
        "method": "bank_transfer",
        "note": "First installment",
        "paidAt": "2026-08-20T10:00:00Z"
      }
    ],
    "reminderLogs": [
      {
        "id": "rem_333444",
        "stage": 1,
        "channel": "PUSH",
        "sentAt": "2026-08-31T09:00:00Z",
        "deliveredAt": "2026-08-31T09:00:02Z"
      }
    ],
    "attachments": [
      {
        "id": "att_555666",
        "url": "https://storage.loantrack.app/attachments/loan_xyz789/receipt.jpg",
        "type": "image",
        "uploadedAt": "2026-08-11T14:36:00Z"
      }
    ],
    "digitalIOU": null
  }
}
```

---

#### `PATCH /loans/:id`

Edit a loan (lender only).

**Auth Required:** Yes

**Request:**
```json
{
  "dueDate": "2026-10-01T00:00:00Z",
  "interestRate": 5.0,
  "purpose": "Dinner at Nobu + drinks"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "loan_xyz789",
    "dueDate": "2026-10-01T00:00:00Z",
    "interestRate": 5.0,
    "purpose": "Dinner at Nobu + drinks",
    "updatedAt": "2026-08-11T14:40:00Z",
    "changeLog": [
      { "field": "dueDate", "oldValue": "2026-09-01T00:00:00Z", "newValue": "2026-10-01T00:00:00Z" },
      { "field": "interestRate", "oldValue": "0", "newValue": "5" },
      { "field": "purpose", "oldValue": "Dinner at Nobu", "newValue": "Dinner at Nobu + drinks" }
    ]
  }
}
```

**Errors:** `403` Not the lender, `400` Cannot edit a PAID/FORGIVEN loan

---

#### `DELETE /loans/:id`

Cancel a loan (lender only, before borrower acceptance).

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "loan_xyz789",
    "status": "CANCELLED",
    "cancelledAt": "2026-08-11T14:45:00Z"
  }
}
```

**Errors:** `403` Not the lender, `409` Borrower already accepted

---

#### `POST /loans/:id/accept`

Borrower accepts a loan.

**Auth Required:** Yes  
**Headers:** `X-Pin-Token: pin_tok_xyz789`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "loan_xyz789",
    "borrowerAcceptedAt": "2026-08-11T15:00:00Z",
    "reminderLadderActivatedAt": "2026-08-11T15:00:00Z"
  }
}
```

---

#### `POST /loans/:id/dispute`

Flag a loan as disputed.

**Auth Required:** Yes

**Request:**
```json
{
  "reason": "I believe the amount is incorrect. We agreed on $120, not $150."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "loan_xyz789",
    "status": "DISPUTED",
    "disputedAt": "2026-08-11T15:10:00Z",
    "disputedBy": "usr_def456"
  }
}
```

---

#### `POST /loans/:id/resolve-dispute`

Resolve a dispute (lender only).

**Auth Required:** Yes

**Request:**
```json
{
  "resolution": "amount_corrected",
  "newAmount": 120.00,
  "note": "Agreed to reduce to $120 based on actual bill."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "loan_xyz789",
    "status": "ACTIVE",
    "amount": 120.00,
    "remainingBalance": 120.00,
    "resolvedAt": "2026-08-11T15:20:00Z"
  }
}
```

---

### 3.4 Payments

#### `POST /loans/:id/payments`

Record a payment on a loan.

**Auth Required:** Yes

**Request:**
```json
{
  "amount": 50.00,
  "method": "venmo",
  "note": "Partial payment - half of dinner",
  "paidAt": "2026-08-20T10:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "pay_111222",
    "loanId": "loan_xyz789",
    "amount": 50.00,
    "method": "venmo",
    "note": "Partial payment - half of dinner",
    "paidAt": "2026-08-20T10:00:00Z",
    "remainingBalance": 25.00,
    "loanStatus": "ACTIVE",
    "isFullyPaid": false
  }
}
```

**Full payment response (loan now PAID):**
```json
{
  "success": true,
  "data": {
    "id": "pay_111223",
    "loanId": "loan_xyz789",
    "amount": 75.00,
    "method": "bank_transfer",
    "note": "Final payment",
    "paidAt": "2026-08-25T14:00:00Z",
    "remainingBalance": 0.00,
    "loanStatus": "PAID",
    "isFullyPaid": true,
    "trustScoreDelta": { "lender": 0, "borrower": 5 },
    "celebration": {
      "animation": "confetti",
      "message": "🎉 Loan fully repaid! Marcus has repaid $150.00 for Dinner at Nobu.",
      "shareableUrl": "https://loantrack.app/celebrate/loan_xyz789"
    }
  }
}
```

---

#### `GET /loans/:id/payments`

List all payments for a loan.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pay_111222",
      "amount": 50.00,
      "method": "venmo",
      "note": "Partial payment - half of dinner",
      "paidAt": "2026-08-20T10:00:00Z",
      "recordedBy": { "id": "usr_def456", "displayName": "Marcus" }
    },
    {
      "id": "pay_111223",
      "amount": 75.00,
      "method": "bank_transfer",
      "note": "Final payment",
      "paidAt": "2026-08-25T14:00:00Z",
      "recordedBy": { "id": "usr_abc123", "displayName": "Priya" }
    }
  ]
}
```

---

### 3.5 Reminders

#### `GET /loans/:id/reminders/ladder`

Get the escalation ladder configuration for a loan.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "currentStage": 1,
    "stages": [
      { "level": 1, "delayDays": -1, "tone": "FRIENDLY", "template": "Hey {borrower_name}! Just a heads-up...", "channel": "PUSH", "includeMeme": false },
      { "level": 2, "delayDays": 0, "tone": "POLITE", "template": "Hi {borrower_name}, just a reminder...", "channel": "PUSH", "includeMeme": false },
      { "level": 3, "delayDays": 7, "tone": "FIRM", "template": "Hi {borrower_name}, {amount} is now...", "channel": "BOTH", "includeMeme": false },
      { "level": 4, "delayDays": 14, "tone": "SERIOUS", "template": "This is a final reminder...", "channel": "BOTH", "includeMeme": true }
    ]
  }
}
```

---

#### `PUT /loans/:id/reminders/ladder`

Update escalation ladder (lender only).

**Auth Required:** Yes

**Request:**
```json
{
  "isActive": true,
  "stages": [
    { "level": 1, "delayDays": -2, "tone": "FRIENDLY", "channel": "PUSH", "template": "Hey! Quick reminder...", "includeMeme": false },
    { "level": 2, "delayDays": 0, "tone": "POLITE", "channel": "PUSH", "template": "Friendly reminder about...", "includeMeme": false },
    { "level": 3, "delayDays": 5, "tone": "FIRM", "channel": "BOTH", "template": "Your loan is now overdue...", "includeMeme": false },
    { "level": 4, "delayDays": 10, "tone": "SERIOUS", "channel": "BOTH", "template": "Final notice...", "includeMeme": true }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "loanId": "loan_xyz789",
    "updatedAt": "2026-08-11T15:00:00Z"
  }
}
```

---

#### `POST /loans/:id/reminders/send`

Manually send a reminder immediately (bypass ladder schedule).

**Auth Required:** Yes

**Request:**
```json
{
  "message": "Hey, just checking in about the dinner money! No rush.",
  "channel": "PUSH"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "rem_555777",
    "stage": "MANUAL",
    "channel": "PUSH",
    "sentAt": "2026-08-11T15:05:00Z"
  }
}
```

---

### 3.6 Trust Score

#### `GET /users/:id/trust-score`

Get a user's trust score (public tier info or detailed if self).

**Auth Required:** Yes

**Response (200) — Self:**
```json
{
  "success": true,
  "data": {
    "userId": "usr_abc123",
    "score": 720,
    "tier": "TRUSTED",
    "breakdown": {
      "baseScore": 300,
      "repaymentBonus": 285,
      "defaultPenalty": -15,
      "tenureBonus": 50,
      "volumeBonus": 75,
      "badgeBonus": 25
    },
    "recentEvents": [
      { "type": "ON_TIME_REPAYMENT", "delta": 5, "newScore": 720, "loanId": "loan_xyz789", "createdAt": "2026-08-10T14:00:00Z" },
      { "type": "TIER_UPGRADE", "delta": 0, "newScore": 715, "fromTier": "RELIABLE", "toTier": "TRUSTED", "createdAt": "2026-08-09T02:00:00Z" }
    ],
    "badges": ["FIRST_REPAYMENT", "IRONCLAD"],
    "updatedAt": "2026-08-10T14:00:01Z"
  }
}
```

**Response (200) — Other user (public only):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_def456",
    "tier": "RELIABLE",
    "onTimeRepaymentPercent": 85,
    "totalLoansCompleted": 12
  }
}
```

---

#### `GET /users/me/trust-score/history`

Get full event history for own trust score.

**Auth Required:** Yes

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `page` | number | Default: 1 |
| `limit` | number | Default: 50 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "tse_001", "type": "ON_TIME_REPAYMENT", "delta": 5, "newScore": 720, "associatedLoanId": "loan_xyz789", "createdAt": "2026-08-10T14:00:00Z" }
    ],
    "pagination": { "page": 1, "limit": 50, "totalItems": 87, "totalPages": 2 }
  }
}
```

---

### 3.7 Relationship Heatmap

#### `GET /relationships`

Get all relationship edges for the current user.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nodes": [
      { "id": "usr_abc123", "displayName": "Priya", "avatarUrl": "...", "volume": 5000, "trustTier": "TRUSTED", "isCurrentUser": true },
      { "id": "usr_def456", "displayName": "Marcus", "avatarUrl": "...", "volume": 1200, "trustTier": "RELIABLE" },
      { "id": "usr_ghi789", "displayName": "Aisha", "avatarUrl": "...", "volume": 800, "trustTier": "BUILDING" }
    ],
    "edges": [
      {
        "source": "usr_abc123",
        "target": "usr_def456",
        "totalLent": 1500,
        "totalBorrowed": 200,
        "netPosition": 1300,
        "loanCount": 8,
        "onTimeCount": 6,
        "onTimePercent": 75,
        "avgRepaymentDays": 3.5,
        "lastInteractionAt": "2026-08-10T14:00:00Z"
      },
      {
        "source": "usr_ghi789",
        "target": "usr_abc123",
        "totalLent": 800,
        "totalBorrowed": 0,
        "netPosition": 800,
        "loanCount": 3,
        "onTimeCount": 3,
        "onTimePercent": 100,
        "avgRepaymentDays": 1.2,
        "lastInteractionAt": "2026-07-28T09:00:00Z"
      }
    ]
  }
}
```

---

#### `GET /relationships/:userId`

Get detailed relationship with a specific user.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "counterparty": {
      "id": "usr_def456",
      "displayName": "Marcus",
      "avatarUrl": "...",
      "trustTier": "RELIABLE"
    },
    "totalLent": 1500,
    "totalBorrowed": 200,
    "netPosition": 1300,
    "loanCount": 8,
    "onTimeCount": 6,
    "lateCount": 1,
    "defaultCount": 0,
    "avgRepaymentDays": 3.5,
    "firstInteractionAt": "2026-01-20T12:00:00Z",
    "lastInteractionAt": "2026-08-10T14:00:00Z",
    "monthlyBreakdown": [
      { "month": "2026-01", "lent": 200, "repaid": 200 },
      { "month": "2026-02", "lent": 300, "repaid": 0 },
      { "month": "2026-03", "lent": 0, "repaid": 300 }
    ]
  }
}
```

---

### 3.8 Digital IOU

#### `POST /loans/:id/iou`

Generate a Digital IOU for a loan.

**Auth Required:** Yes

**Request:**
```json
{
  "lenderParty": {
    "legalName": "Priya Krishnan",
    "phone": "+14155551234",
    "signature": "data:image/png;base64,iVBORw0KGgo..." // canvas-drawn signature
  },
  "borrowerParty": {
    "legalName": "Marcus Williams",
    "phone": "+14155559876",
    "signature": "data:image/png;base64,iVBORw0KGgo..."
  },
  "includeIpAddress": true,
  "includeDeviceInfo": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "iou_abc999",
    "loanId": "loan_xyz789",
    "iouId": "IOU-2026-ABC123",
    "status": "SIGNED",
    "pdfUrl": "https://storage.loantrack.app/ious/iou_abc999.pdf",
    "verificationUrl": "https://loantrack.app/verify/iou_abc999",
    "qrCodeUrl": "https://storage.loantrack.app/ious/iou_abc999_qr.png",
    "signedAt": "2026-08-11T15:30:00Z"
  }
}
```

---

#### `GET /loans/:id/iou`

Get the IOU for a loan.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "iou_abc999",
    "iouId": "IOU-2026-ABC123",
    "loanAmount": 150.00,
    "currency": "USD",
    "lenderParty": {
      "legalName": "Priya Krishnan",
      "phone": "+14155551234",
      "signatureUrl": "https://storage.loantrack.app/signatures/iou_abc999_lender.png",
      "signedAt": "2026-08-11T15:29:00Z"
    },
    "borrowerParty": {
      "legalName": "Marcus Williams",
      "phone": "+14155559876",
      "signatureUrl": "https://storage.loantrack.app/signatures/iou_abc999_borrower.png",
      "signedAt": "2026-08-11T15:30:00Z"
    },
    "pdfUrl": "https://storage.loantrack.app/ious/iou_abc999.pdf",
    "verificationUrl": "https://loantrack.app/verify/iou_abc999"
  }
}
```

---

#### `GET /verify/:iouId`

Public IOU verification page (no auth required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "iouId": "IOU-2026-ABC123",
    "loanAmount": 150.00,
    "currency": "USD",
    "loanPurpose": "Dinner at Nobu",
    "dueDate": "2026-09-01T00:00:00Z",
    "loanStatus": "ACTIVE",
    "lenderName": "Priya Krishnan",
    "borrowerName": "Marcus Williams",
    "signedAt": "2026-08-11T15:30:00Z",
    "verified": true
  }
}
```

---

### 3.9 Loan-Free Streaks

#### `GET /users/me/streak`

Get current user's streak info.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "currentStreak": 23,
    "longestStreak": 45,
    "lastResetAt": "2026-07-19T10:00:00Z",
    "lastResetReason": "NEW_LOAN_CREATED",
    "milestones": [
      { "days": 7, "badge": "WEEK_OF_FREEDOM", "achievedAt": "2026-01-22T02:00:00Z" },
      { "days": 30, "badge": "MONTHLY_MASTERY", "achievedAt": "2026-02-15T02:00:00Z" },
      { "days": 90, "badge": "QUARTERLY_CHAMPION", "achievedAt": null }
    ],
    "nextMilestone": { "days": 30, "daysRemaining": 7, "badge": "MONTHLY_MASTERY" }
  }
}
```

---

#### `GET /users/me/streak/leaderboard`

Opt-in friend leaderboard.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rankings": [
      { "userId": "usr_ghi789", "displayName": "Aisha", "streak": 67, "avatarUrl": "..." },
      { "userId": "usr_abc123", "displayName": "Priya", "streak": 23, "avatarUrl": "...", "isCurrentUser": true },
      { "userId": "usr_def456", "displayName": "Marcus", "streak": 5, "avatarUrl": "..." }
    ],
    "totalParticipants": 15
  }
}
```

---

### 3.10 Loan Gifting

#### `POST /loans/:id/gift`

Forgive a loan as a gift.

**Auth Required:** Yes  
**Headers:** `X-Pin-Token: pin_tok_xyz789`

**Request:**
```json
{
  "occasion": "BIRTHDAY",
  "message": "Happy Birthday Marcus! Consider this my gift to you. 🎂"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "gift_abc888",
    "loanId": "loan_xyz789",
    "lenderId": "usr_abc123",
    "borrowerId": "usr_def456",
    "amount": 150.00,
    "occasion": "BIRTHDAY",
    "message": "Happy Birthday Marcus! Consider this my gift to you. 🎂",
    "forgivenAt": "2026-08-11T16:00:00Z",
    "celebration": {
      "title": "🎉 Loan Forgiven!",
      "subtitle": "Priya forgave your $150.00 loan",
      "occasionEmoji": "🎂",
      "animationType": "confetti",
      "shareableCardUrl": "https://loantrack.app/gift/gift_abc888/card"
    },
    "trustScoreDelta": { "lender": 10, "borrower": 0 }
  }
}
```

**Errors:** `403` Not the lender, `409` Loan already paid/forgiven, `400` Loan must be ACTIVE or OVERDUE

---

#### `GET /users/me/gifts`

List all gifts given/received.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "given": [
      {
        "id": "gift_abc888",
        "toUser": { "id": "usr_def456", "displayName": "Marcus", "avatarUrl": "..." },
        "amount": 150.00,
        "occasion": "BIRTHDAY",
        "message": "Happy Birthday Marcus!",
        "forgivenAt": "2026-08-11T16:00:00Z"
      }
    ],
    "received": [
      {
        "id": "gift_xyz777",
        "fromUser": { "id": "usr_jkl012", "displayName": "Aisha", "avatarUrl": "..." },
        "amount": 50.00,
        "occasion": "JUST_BECAUSE",
        "message": "You've been a great friend!",
        "forgivenAt": "2026-07-04T12:00:00Z"
      }
    ]
  }
}
```

---

### 3.11 Dashboard

#### `GET /dashboard`

Get dashboard summary data.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activeLoans": {
      "asLender": { "count": 5, "totalOutstanding": 1250.00 },
      "asBorrower": { "count": 2, "totalOutstanding": 300.00 }
    },
    "paidLoans": {
      "asLender": { "count": 23, "totalRepaid": 8750.00 },
      "asBorrower": { "count": 15, "totalRepaid": 4200.00 }
    },
    "overdueLoans": {
      "asLender": { "count": 1, "totalAmount": 200.00 },
      "asBorrower": { "count": 0, "totalAmount": 0 }
    },
    "upcomingDueDates": [
      { "loanId": "loan_xyz789", "counterpartyName": "Marcus", "amount": 150.00, "remainingBalance": 75.00, "dueDate": "2026-09-01T00:00:00Z", "daysUntilDue": 21 }
    ],
    "trustScore": { "score": 720, "tier": "TRUSTED", "trend": "up" },
    "currentStreak": 23,
    "pendingNotifications": 3
  }
}
```

---

### 3.12 Notifications

#### `GET /notifications`

List notifications.

**Auth Required:** Yes

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `unreadOnly` | boolean | Filter to unread only |
| `page` | number | Default: 1 |
| `limit` | number | Default: 30 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "not_123",
        "type": "LOAN_OVERDUE",
        "title": "Loan Overdue",
        "body": "Marcus's $150.00 loan for Dinner at Nobu is now 3 days overdue.",
        "data": { "loanId": "loan_xyz789" },
        "isRead": false,
        "createdAt": "2026-09-04T09:00:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": { "page": 1, "limit": 30, "totalItems": 45, "totalPages": 2 }
  }
}
```

---

#### `PATCH /notifications/:id/read`

Mark notification as read.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "not_123", "isRead": true }
}
```

---

#### `POST /notifications/read-all`

Mark all notifications as read.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": { "markedRead": 12 }
}
```

---

### 3.13 Device Tokens

#### `POST /devices`

Register device for push notifications.

**Auth Required:** Yes

**Request:**
```json
{
  "token": "fcm_token_abc123...",
  "platform": "ios",
  "deviceName": "iPhone 16 Pro"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "dev_abc123" }
}
```

---

#### `DELETE /devices/:id`

Unregister device.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true
}
```

---

### 3.14 Attachments

#### `POST /loans/:id/attachments`

Upload an attachment to a loan (multipart/form-data).

**Auth Required:** Yes

**Request:** `multipart/form-data` with `file` field (max 10MB, images/PDF/audio).

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "att_555666",
    "url": "https://storage.loantrack.app/attachments/loan_xyz789/receipt.jpg",
    "type": "image",
    "filename": "receipt.jpg",
    "sizeBytes": 245760,
    "uploadedAt": "2026-08-11T14:36:00Z"
  }
}
```

---

#### `DELETE /attachments/:id`

Delete an attachment.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true
}
```

---

## 4. Database Schema

> **Technology:** Prisma ORM + PostgreSQL 16 (Supabase)  
> **File:** `packages/prisma/schema.prisma`

```prisma
// ============================================================================
// LoanTrack — Complete Prisma Schema
// ============================================================================

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

generator zod {
  provider = "prisma-generator-zod"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgcrypto, citext]
}

// ============================================================================
// ENUMS
// ============================================================================

enum LoanStatus {
  ACTIVE
  OVERDUE
  PAID
  FORGIVEN
  DISPUTED
  CANCELLED
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  VENMO
  PAYPAL
  CASHAPP
  CRYPTO
  OTHER
}

enum ReminderTone {
  FRIENDLY
  POLITE
  FIRM
  SERIOUS
}

enum ReminderChannel {
  PUSH
  SMS
  BOTH
}

enum TrustScoreTier {
  UNTRUSTED
  BUILDING
  RELIABLE
  TRUSTED
  EXEMPLARY
}

enum TrustScoreEventType {
  ON_TIME_REPAYMENT
  LATE_REPAYMENT
  DEFAULT_UNRESOLVED
  DISPUTE_RESOLVED_POSITIVE
  DISPUTE_RESOLVED_NEGATIVE
  LOAN_FORGIVEN
  STREAK_MILESTONE
  TIER_UPGRADE
  TIER_DOWNGRADE
  GENEROSITY_BONUS
  PENALTY_APPLIED
}

enum IOUStatus {
  DRAFT
  PENDING_LENDER
  PENDING_BORROWER
  SIGNED
  REVOKED
}

enum IOUSignatureMethod {
  DRAW
  TYPE
}

enum GiftOccasion {
  BIRTHDAY
  HOLIDAY
  ANNIVERSARY
  GRADUATION
  JUST_BECAUSE
  CUSTOM
}

enum StreakMilestoneBadge {
  WEEK_OF_FREEDOM
  MONTHLY_MASTERY
  QUARTERLY_CHAMPION
  HALF_YEAR_HERO
  DEBT_FREE_LEGEND
}

enum StreakResetReason {
  NEW_LOAN_CREATED
  ADMIN_RESET
}

enum NotificationType {
  LOAN_CREATED
  LOAN_ACCEPTED
  LOAN_OVERDUE
  PAYMENT_RECEIVED
  REMINDER_SENT
  LOAN_GIFTED
  STREAK_MILESTONE
  TRUST_TIER_CHANGE
  IOU_SIGNED
  LOAN_DISPUTED
}

enum NotificationChannelType {
  PUSH
  SMS
  EMAIL
  IN_APP
}

// ============================================================================
// MODELS
// ============================================================================

model User {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  phone             String    @unique @db.VarChar(20)
  phoneHash         String    @unique @db.VarChar(64) // SHA-256 hash for contact lookup
  displayName       String?   @db.VarChar(100)
  avatarUrl         String?   @db.VarChar(500)
  defaultCurrency   String    @default("USD") @db.VarChar(3)
  isTrustScorePublic Boolean   @default(false)
  hasPinSet          Boolean   @default(false)
  pinHash           String?   @db.VarChar(60) // bcrypt hash of local PIN
  pinAttempts       Int       @default(0)
  pinLockedUntil    DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime? // soft delete (GDPR)

  // Relations
  loansAsLender      Loan[]          @relation("LenderLoans")
  loansAsBorrower    Loan[]          @relation("BorrowerLoans")
  recordedPayments   Payment[]       @relation("RecordedBy")
  trustScore         TrustScore?
  trustScoreEvents   TrustScoreEvent[]
  relationshipEdgesAsSource  RelationshipEdge[] @relation("SourceEdges")
  relationshipEdgesAsTarget  RelationshipEdge[] @relation("TargetEdges")
  iouParties         IOUParty[]
  loanFreeStreak     LoanFreeStreak?
  giftsGiven         Gift[]          @relation("GiftsGiven")
  giftsReceived      Gift[]          @relation("GiftsReceived")
  deviceTokens       DeviceToken[]
  notificationLogs   NotificationLog[]
  reminderLogs       ReminderLog[]
  paymentConfirmations PaymentConfirmation[]

  @@index([phoneHash])
  @@index([createdAt])
  @@map("users")
}

model Loan {
  id                    String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  lenderId              String     @db.Uuid
  borrowerId            String     @db.Uuid
  amount                Decimal    @db.Decimal(12, 2)
  remainingBalance      Decimal    @db.Decimal(12, 2)
  currency              String     @default("USD") @db.VarChar(3)
  purpose               String     @db.VarChar(500)
  interestRate          Decimal    @default(0) @db.Decimal(5, 2)
  collateralDescription String?
  status                LoanStatus @default(ACTIVE)
  escalationStage       Int        @default(0) // 0 = not yet, 1-4 = current stage
  dueDate               DateTime   @db.Date
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt
  borrowerAcceptedAt    DateTime?
  paidAt                DateTime?
  forgivenAt            DateTime?
  disputedAt            DateTime?
  disputedBy            String?    @db.Uuid
  cancelledAt           DateTime?
  deletedAt             DateTime?  // soft delete with recovery window

  // Relations
  lender              User         @relation("LenderLoans", fields: [lenderId], references: [id])
  borrower            User         @relation("BorrowerLoans", fields: [borrowerId], references: [id])
  payments            Payment[]
  reminderTemplate    ReminderTemplate?
  reminderLogs        ReminderLog[]
  attachments         Attachment[]
  digitalIOU          DigitalIOU?
  gift                Gift?
  trustScoreEvents    TrustScoreEvent[]
  paymentConfirmations PaymentConfirmation[]

  @@index([lenderId, status])
  @@index([borrowerId, status])
  @@index([dueDate])
  @@index([status, escalationStage])
  @@index([createdAt])
  @@map("loans")
}

model Payment {
  id           String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  loanId       String        @db.Uuid
  amount       Decimal       @db.Decimal(12, 2)
  method       PaymentMethod @default(OTHER)
  note         String?       @db.VarChar(500)
  purposeTag   String?       @db.VarChar(200)
  paidAt       DateTime      @default(now())
  recordedById String        @db.Uuid
  createdAt    DateTime      @default(now())

  // Relations
  loan       Loan @relation(fields: [loanId], references: [id])
  recordedBy User @relation("RecordedBy", fields: [recordedById], references: [id])

  @@index([loanId])
  @@index([paidAt])
  @@map("payments")
}

model PaymentConfirmation {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  loanId          String    @db.Uuid
  paymentId       String?   @db.Uuid
  confirmedById   String    @db.Uuid
  confirmationType String   @db.VarChar(20) // "PIN" or "BIOMETRIC"
  confirmedAt     DateTime  @default(now())

  loan      Loan     @relation(fields: [loanId], references: [id])
  payment   Payment? @relation(fields: [paymentId], references: [id])
  confirmedBy User   @relation(fields: [confirmedById], references: [id])

  @@index([loanId])
  @@map("payment_confirmations")
}

model ReminderTemplate {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  loanId    String    @unique @db.Uuid
  isActive  Boolean   @default(true)
  stages    Json      @db.JsonB // Array of { level, delayDays, tone, template, channel, includeMeme }
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relations
  loan Loan @relation(fields: [loanId], references: [id])

  @@map("reminder_templates")
}

model ReminderLog {
  id          String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  loanId      String              @db.Uuid
  stage       Int                 // 1-4 or 0 for MANUAL
  tone        ReminderTone        @default(FRIENDLY)
  channel     NotificationChannelType
  messageBody String?             @db.VarChar(1000)
  memeUrl     String?             @db.VarChar(500)
  sentAt      DateTime            @default(now())
  deliveredAt DateTime?
  readAt      DateTime?
  errorAt     DateTime?
  errorReason String?             @db.VarChar(500)
  triggeredBy String?             @db.Uuid // null = system, userId = manual
  createdAt   DateTime            @default(now())

  // Relations
  loan        Loan @relation(fields: [loanId], references: [id])
  triggeredByUser User? @relation(fields: [triggeredBy], references: [id])

  @@index([loanId, stage])
  @@index([sentAt])
  @@map("reminder_logs")
}

model TrustScore {
  id          String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String         @unique @db.Uuid
  score       Int            @default(300)
  tier        TrustScoreTier @default(BUILDING)
  breakdown   Json           @db.JsonB // { baseScore, repaymentBonus, defaultPenalty, tenureBonus, volumeBonus, badgeBonus }
  updatedAt   DateTime       @updatedAt
  createdAt   DateTime       @default(now())

  // Relations
  user  User              @relation(fields: [userId], references: [id])
  events TrustScoreEvent[]

  @@index([score])
  @@index([tier])
  @@map("trust_scores")
}

model TrustScoreEvent {
  id               String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId           String               @db.Uuid
  type             TrustScoreEventType
  delta            Int                  // points added or subtracted
  newScore         Int
  associatedLoanId String?              @db.Uuid
  metadata         Json?                @db.JsonB // { fromTier, toTier, badge, milestone }
  createdAt        DateTime             @default(now())

  // Relations
  user            User  @relation(fields: [userId], references: [id])
  associatedLoan  Loan? @relation(fields: [associatedLoanId], references: [id])

  @@index([userId, createdAt])
  @@index([type])
  @@map("trust_score_events")
}

model RelationshipEdge {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sourceUserId      String   @db.Uuid // the user viewing the heatmap
  targetUserId      String   @db.Uuid // the counterparty
  totalLent         Decimal  @default(0) @db.Decimal(14, 2)
  totalBorrowed     Decimal  @default(0) @db.Decimal(14, 2)
  loanCount         Int      @default(0)
  onTimeCount       Int      @default(0)
  lateCount         Int      @default(0)
  defaultCount      Int      @default(0)
  avgRepaymentDays  Decimal  @default(0) @db.Decimal(7, 2)
  firstInteractionAt DateTime?
  lastInteractionAt DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  sourceUser User @relation("SourceEdges", fields: [sourceUserId], references: [id])
  targetUser User @relation("TargetEdges", fields: [targetUserId], references: [id])

  @@unique([sourceUserId, targetUserId])
  @@index([sourceUserId])
  @@index([totalLent])
  @@map("relationship_edges")
}

model DigitalIOU {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  loanId           String    @unique @db.Uuid
  iouId            String    @unique @db.VarChar(30) // "IOU-2026-ABC123"
  status           IOUStatus @default(DRAFT)
  pdfUrl           String?   @db.VarChar(500)
  verificationUrl  String?   @db.VarChar(500)
  qrCodeUrl        String?   @db.VarChar(500)
  signedAt         DateTime?
  revokedAt        DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  loan    Loan       @relation(fields: [loanId], references: [id])
  parties IOUParty[]

  @@index([loanId])
  @@map("digital_ious")
}

model IOUParty {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  iouId           String              @db.Uuid
  userId          String              @db.Uuid
  role            String              @db.VarChar(10) // "LENDER" or "BORROWER"
  legalName       String              @db.VarChar(200)
  phone           String              @db.VarChar(20)
  signatureUrl    String?             @db.VarChar(500)
  signatureMethod IOUSignatureMethod?
  ipAddress       String?             @db.VarChar(45) // encrypted at rest
  deviceInfo      String?             @db.VarChar(500)
  signedAt        DateTime?

  // Relations
  iou  DigitalIOU @relation(fields: [iouId], references: [id])
  user User       @relation(fields: [userId], references: [id])

  @@unique([iouId, role])
  @@map("iou_parties")
}

model LoanFreeStreak {
  id              String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String            @unique @db.Uuid
  currentStreak   Int               @default(0)
  longestStreak   Int               @default(0)
  lastResetAt     DateTime?
  lastResetReason StreakResetReason?
  updatedAt       DateTime          @updatedAt
  createdAt       DateTime          @default(now())

  // Relations
  user       User              @relation(fields: [userId], references: [id])
  milestones StreakMilestone[]

  @@index([currentStreak])
  @@map("loan_free_streaks")
}

model StreakMilestone {
  id              String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  streakId        String               @db.Uuid
  days            Int                  // 7, 30, 90, 180, 365
  badge           StreakMilestoneBadge
  achievedAt      DateTime?            // null if not yet achieved
  notifiedAt      DateTime?            // when push notification was sent
  createdAt       DateTime             @default(now())

  // Relations
  streak LoanFreeStreak @relation(fields: [streakId], references: [id])

  @@unique([streakId, badge])
  @@map("streak_milestones")
}

model Gift {
  id           String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  loanId       String       @unique @db.Uuid
  lenderId     String       @db.Uuid
  borrowerId   String       @db.Uuid
  amount       Decimal      @db.Decimal(12, 2)
  occasion     GiftOccasion @default(JUST_BECAUSE)
  message      String?      @db.VarChar(200)
  forgivenAt   DateTime     @default(now())
  createdAt    DateTime     @default(now())

  // Relations
  loan     Loan @relation(fields: [loanId], references: [id])
  lender   User @relation("GiftsGiven", fields: [lenderId], references: [id])
  borrower User @relation("GiftsReceived", fields: [borrowerId], references: [id])

  @@index([lenderId])
  @@index([borrowerId])
  @@map("gifts")
}

model DeviceToken {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId     String   @db.Uuid
  token      String   @unique @db.VarChar(500) // FCM token
  platform   String   @db.VarChar(10) // "ios", "android"
  deviceName String?  @db.VarChar(200)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([token])
  @@map("device_tokens")
}

model NotificationLog {
  id          String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String                 @db.Uuid
  type        NotificationType
  channel     NotificationChannelType
  title       String                 @db.VarChar(200)
  body        String                 @db.VarChar(1000)
  data        Json?                  @db.JsonB // { loanId, etc. }
  isRead      Boolean                @default(false)
  readAt      DateTime?
  deliveryStatus String?             @db.VarChar(20) // "sent", "delivered", "failed"
  createdAt   DateTime               @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id])

  @@index([userId, isRead, createdAt])
  @@index([userId, createdAt])
  @@map("notification_logs")
}

model Attachment {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  loanId     String   @db.Uuid
  url        String   @db.VarChar(500)
  type       String   @db.VarChar(20) // "image", "pdf", "audio"
  filename   String   @db.VarChar(255)
  sizeBytes  Int
  uploadedBy String   @db.Uuid
  uploadedAt DateTime @default(now())

  // Relations
  loan Loan @relation(fields: [loanId], references: [id])

  @@index([loanId])
  @@map("attachments")
}

model LoanAuditLog {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  loanId    String   @db.Uuid
  userId    String   @db.Uuid
  action    String   @db.VarChar(50) // "CREATED", "UPDATED", "CANCELLED", etc.
  changes   Json?    @db.JsonB // [{ field, oldValue, newValue }]
  createdAt DateTime @default(now())

  @@index([loanId, createdAt])
  @@map("loan_audit_logs")
}
```

### Schema Notes

- **UUIDs:** All primary keys use `gen_random_uuid()` for distributed ID generation (no auto-increment).
- **`@db.JsonB`** is used for flexible nested data: reminder ladder stages, trust score breakdown, notification payload, audit change logs.
- **`@db.Decimal`** ensures precise monetary calculations (no floating-point rounding errors).
- **`@db.Citext`** extension available for case-insensitive text lookups.
- **`pgcrypto`** extension for `gen_random_uuid()`.
- **Soft deletes** on User (`deletedAt`) and Loan (`deletedAt`) for GDPR compliance with recovery windows.
- **Phone hashing** (`phoneHash`) enables contact lookup without storing raw phone numbers in the clear — SHA-256 with application-level pepper.
- **`ReminderTemplate.stages`** is stored as JSONB for maximum flexibility — each loan can have a completely different escalation ladder.
- **`Attachment`** is a separate model from `Payment` — a loan can have multiple attachments (receipts, photos, voice memos), and a payment can additionally reference them.
- **`LoanAuditLog`** provides an immutable change history for every loan edit — critical for dispute resolution.
- **`PaymentConfirmation`** tracks PIN/biometric confirmations for high-value payment verification.

---

## 5. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AUTHENTICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  User                    Expo App                Supabase Auth          Fastify API
  ────                    ────────                ─────────────          ───────────
   │                         │                         │                     │
   │  1. Enter phone #       │                         │                     │
   │────────────────────────▶│                         │                     │
   │                         │  2. POST /auth/otp/send │                     │
   │                         │     { phone }           │                     │
   │                         │────────────────────────▶│                     │
   │                         │                         │  3. Twilio Verify   │
   │                         │                         │     Send OTP SMS    │
   │  4. Receive SMS w/ OTP  │                         │                     │
   │◀ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                         │                     │
   │                         │                         │                     │
   │  5. Enter 6-digit OTP   │                         │                     │
   │────────────────────────▶│                         │                     │
   │                         │  6. POST /auth/otp/ver  │                     │
   │                         │     { phone, code }     │                     │
   │                         │────────────────────────▶│                     │
   │                         │                         │  7. Verify OTP      │
   │                         │                         │                     │
   │                         │  8. JWT (access + refresh)                    │
   │                         │◀────────────────────────│                     │
   │                         │                         │                     │
   │                         │  9. Store JWT in SecureStore                  │
   │                         │     (iOS Keychain / Android Keystore)         │
   │                         │                         │                     │
   │ 10. If new user:        │                         │                     │
   │     Set display name    │  POST /users/me         │                     │
   │     Set avatar          │─────────────────────────┼────────────────────▶│
   │                         │                         │                     │
   │ 11. Set 4-6 digit PIN   │                         │                     │
   │────────────────────────▶│                         │                     │
   │                         │  POST /auth/pin/setup   │                     │
   │                         │  { pin }                │                     │
   │                         │─────────────────────────┼────────────────────▶│
   │                         │                         │  - bcrypt(pin)      │
   │                         │                         │  - Store in DB      │
   │                         │                         │                     │
   │                         │◀─── PIN set confirmed ──┼─────────────────────│
   │                         │                         │                     │
   │      ═══════════ SUBSEQUENT APP OPENS ═══════════                       │
   │                         │                         │                     │
   │ 12. App opens           │                         │                     │
   │                         │  13. Check JWT expiry   │                     │
   │                         │      - Valid → skip PIN │                     │
   │                         │      - Expired → refresh│                     │
   │                         │                         │                     │
   │                         │  14. Show PIN pad or    │                     │
   │                         │      Biometric prompt   │                     │
   │────────────────────────▶│                         │                     │
   │  (FaceID / TouchID)     │                         │                     │
   │                         │                         │                     │
   │                         │  15. POST /auth/pin/ver │                     │
   │                         │      { pin }            │                     │
   │                         │─────────────────────────┼────────────────────▶│
   │                         │                         │  - bcrypt.compare() │
   │                         │                         │  - Issue pinToken   │
   │                         │◀── pinToken ────────────┼─────────────────────│
   │                         │                         │                     │
   │                         │  16. App unlocked       │                     │
   │                         │      pinToken cached    │                     │
   │                         │      for 15 minutes      │                     │
   │                         │                         │                     │
```

### Key Auth Design Decisions

1. **JWT via Supabase Auth (GoTrue):** Access tokens expire in 15 minutes. Refresh tokens last 30 days. Supabase manages token lifecycle, revocation, and rotation.
2. **Local PIN separate from Supabase:** The PIN is a second factor specific to the device. It is NOT the Supabase password — it's hashed with bcrypt (cost factor 12) and stored in the User model (`pinHash`). This keeps auth independent of Supabase internals.
3. **pinToken:** Sensitive operations (gifting, IOU signing, account deletion) require a `pinToken` obtained by re-verifying the PIN. This token expires in 15 minutes and is scoped to the requesting device.
4. **Biometric bridge:** On iOS, `expo-local-authentication` checks FaceID/TouchID. On success, it retrieves the PIN from SecureStore and auto-submits it. The app never stores biometric data — it uses biometrics only as a keychain unlock.
5. **RLS integration:** All Fastify API calls include the authenticated user's `auth.uid()` in the database session context via `SET LOCAL request.jwt.claims` → Supabase RLS policies enforce row access.

---

## 6. Reminder Engine

### BullMQ Job Lifecycle

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           REMINDER ENGINE ARCHITECTURE                        │
└──────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────────────┐
                        │   Cron Scheduler (BullMQ) │
                        │   Repeatable Job          │
                        │   "sweep-overdue-loans"   │
                        │   Runs every 60 minutes   │
                        └────────────┬─────────────┘
                                     │
                                     ▼
               ┌─────────────────────────────────────────┐
               │  Step 1: Query all ACTIVE loans where:   │
               │    dueDate <= NOW()                      │
               │    AND status = ACTIVE                   │
               │    AND reminderTemplate.isActive = true  │
               │    AND borrowerAcceptedAt IS NOT NULL    │
               │    AND deletedAt IS NULL                 │
               └────────────┬────────────────────────────┘
                            │
                            ▼
               ┌─────────────────────────────────────────┐
               │  Step 2: For each overdue loan:          │
               │    daysOverdue = NOW() - dueDate         │
               │    currentStage = Find highest stage     │
               │      where delayDays <= daysOverdue      │
               │    Check if reminder already sent        │
               │      for this stage (ReminderLog)        │
               └────────────┬────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
                    ▼                ▼
          ┌───────────────┐  ┌──────────────────┐
          │ Already sent? │  │ Not yet sent?    │
          │ → Skip        │  │ → Enqueue reminder│
          └───────────────┘  └────────┬─────────┘
                                      │
                                      ▼
               ┌─────────────────────────────────────────┐
               │  Step 3: Enqueue "send-reminder" job     │
               │    {                                     │
               │      loanId, stage, tone, template,      │
               │      channel, borrowerId, lenderName,    │
               │      includeMeme                         │
               │    }                                     │
               └────────────┬────────────────────────────┘
                            │
                            ▼
               ┌─────────────────────────────────────────┐
               │  Step 4: "send-reminder" Worker          │
               │    a. Interpolate template variables     │
               │       {borrower_name}, {amount},         │
               │       {days_overdue}, {due_date}         │
               │    b. If stage == 4 && includeMeme:      │
               │       Select random meme from library    │
               │    c. If channel == PUSH || BOTH:        │
               │       Send FCM push notification         │
               │    d. If channel == SMS || BOTH:         │
               │       Send Twilio SMS                    │
               │    e. Write ReminderLog entry            │
               │    f. If push fails → retry SMS          │
               │    g. Update loan.escalationStage        │
               └────────────┬────────────────────────────┘
                            │
                            ▼
               ┌─────────────────────────────────────────┐
               │  Step 5: Write NotificationLog +         │
               │    Send real-time update via Supabase    │
               │    Realtime (WebSocket) if app is open   │
               └─────────────────────────────────────────┘
```

### Escalation Logic

```
Stage 0: dueDate > NOW()          → No reminders (pre-due)
Stage 1: NOW() >= dueDate - 1d    → Friendly nudge (configurable: -1 to 0 days)
Stage 2: NOW() >= dueDate          → Polite reminder
Stage 3: NOW() >= dueDate + 7d    → Firm warning with Trust Score mention
Stage 4: NOW() >= dueDate + 14d   → Serious + meme injection

Rule: Once a stage is sent, it is never re-sent. Only higher stages trigger.
Rule: If borrower repays partially, ladder does NOT reset — it continues from the current stage.
Rule: If due date is extended, ladder resets to Stage 0 and recalibrates relative to new due date.
Rule: Borrower's preferred hours (e.g., "only after 6 PM") are checked before sending.
        If current time is outside window, job is delayed until next valid time.
```

### Retry Strategy

```
FCM Push:  3 retries with exponential backoff (1min, 5min, 15min)
Twilio SMS: 3 retries with exponential backoff (1min, 3min, 10min)
Both fail after max retries → error logged in ReminderLog, notification sent
                                to lender: "Reminder to {borrower} failed to deliver"
```

---

## 7. Notification Pipeline

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          NOTIFICATION DELIVERY FLOW                           │
└──────────────────────────────────────────────────────────────────────────────┘

Event Source                          Priority Router                     Delivery
────────────                          ────────────────                    ────────
┌──────────┐                          ┌───────────────────┐
│ Loan     │──▶ Loan Created ────────▶│                   │
│ Created  │                          │                   │
└──────────┘                          │                   │
┌──────────┐                          │                   │
│ Payment  │──▶ Payment Received ────▶│                   │
│ Recorded │                          │                   │
└──────────┘                          │                   │       ┌──────────────┐
┌──────────┐                          │  BullMQ Queue     │──────▶│ FCM Worker   │──▶ FCM ──▶ Device
│ Reminder │──▶ Reminder Due ────────▶│  "notifications"  │       └──────────────┘
│ Engine   │                          │                   │
└──────────┘                          │                   │       ┌──────────────┐
┌──────────┐                          │                   │──────▶│ Twilio Worker│──▶ Twilio ──▶ SMS
│ Trust    │──▶ Tier Change ─────────▶│                   │       └──────────────┘
│ Score    │                          │                   │
└──────────┘                          │                   │       ┌──────────────┐
┌──────────┐                          │                   │──────▶│ In-App Worker│──▶ DB (NotificationLog)
│ Streak   │──▶ Milestone ───────────▶│                   │       └──────────────┘
│ Milestone│                          └───────────────────┘
└──────────┘                                   │
┌──────────┐                                   │
│ Gift     │──▶ Loan Forgiven ─────────────────┘
│ Created  │
└──────────┘

Channel Priority (per notification):
  1. FCM Push (instant, zero cost)
  2. SMS fallback (if push token unavailable or push delivery fails)
  3. In-App NotificationLog (always written, regardless of channel)

Delivery Status Tracking:
  - FCM: uses Firebase Admin SDK sendEachForMulticast() → per-token delivery receipts
  - Twilio: uses message status callback webhook → DELIVERED / FAILED / UNDELIVERED
  - All delivery statuses written to NotificationLog.deliveryStatus
```

### FCM Message Structure

```json
{
  "token": "fcm_device_token",
  "notification": {
    "title": "Loan Overdue",
    "body": "Marcus's $150.00 loan is 3 days overdue."
  },
  "data": {
    "type": "LOAN_OVERDUE",
    "loanId": "loan_xyz789",
    "deepLink": "loantrack://loans/loan_xyz789"
  },
  "android": {
    "priority": "high",
    "channelId": "reminders",
    "notification": {
      "sound": "default",
      "clickAction": "FLUTTER_NOTIFICATION_CLICK"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 3,
        "contentAvailable": true,
        "mutableContent": true
      }
    }
  }
}
```

### Twilio SMS Structure

```
From: +1XXXLOANTRACK (branded sender ID)
To: +14155559876
Body: [LoanTrack] Hi Marcus! Just a reminder that $150.00 is due today (Sep 1) for Dinner at Nobu. Thanks! — Priya

Fallback for stage 4+:
Body: [LoanTrack] Final reminder: $150.00 for Dinner at Nobu is now 14 days overdue. 
       https://loantrack.app/l/loan_xyz789
```

---

## 8. Offline Strategy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           OFFLINE ARCHITECTURE                                │
└──────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │           Expo App (Client)               │
                    │                                          │
                    │  ┌──────────────────────────────────┐    │
                    │  │     TanStack Query (React Query) │    │
                    │  │  ┌────────────────────────────┐  │    │
                    │  │  │  persistQueryClient         │  │    │
                    │  │  │  (AsyncStorage persister)   │  │    │
                    │  │  │  - Caches all query data    │  │    │
                    │  │  │  - Restores on app open     │  │    │
                    │  │  │  - Stale-while-revalidate   │  │    │
                    │  │  └────────────────────────────┘  │    │
                    │  └──────────────────────────────────┘    │
                    │                                          │
                    │  ┌──────────────────────────────────┐    │
                    │  │     WatermelonDB (Local SQLite)   │    │
                    │  │  - Full local copy of user's data │    │
                    │  │  - Reactive queries for UI        │    │
                    │  │  - All writes go here first       │    │
                    │  └──────────────────────────────────┘    │
                    │                                          │
                    │  ┌──────────────────────────────────┐    │
                    │  │     Sync Queue                     │    │
                    │  │  - Array of pending mutations      │    │
                    │  │  - Each entry: { id, type,         │    │
                    │  │      endpoint, body, timestamp }   │    │
                    │  │  - Persisted to SQLite (survives   │    │
                    │  │    app kill)                       │    │
                    │  │  - Processed FIFO on reconnect     │    │
                    │  └──────────────────────────────────┘    │
                    │                                          │
                    │  ┌──────────────────────────────────┐    │
                    │  │     Network Monitor                │    │
                    │  │  - @react-native-community/       │    │
                    │  │    netinfo                        │    │
                    │  │  - TanStack Query onlineManager   │    │
                    │  │  - Auto-pause/resume queries      │    │
                    │  │  - Triggers sync queue flush      │    │
                    │  └──────────────────────────────────┘    │
                    └─────────────────────────────────────────┘

Offline Write Flow:
  1. User creates/edits loan → Write to WatermelonDB immediately
  2. UI updates optimistically from local DB
  3. Mutation added to Sync Queue with timestamp
  4. If online: mutation sent to API immediately
  5. If offline: mutation stays in queue
  6. On reconnect: queue drained FIFO → each mutation sent to API
  7. API response updates WatermelonDB with server-generated fields (id, timestamps)

Conflict Resolution:
  - Strategy: Last-Write-Wins + Server Timestamp Anchoring
  - All mutations carry a clientTimestamp
  - Server compares clientTimestamp vs. loan.updatedAt
  - If server timestamp is newer → server wins, client updated
  - If client timestamp is newer → client mutation applied
  - For status changes (PAID, FORGIVEN): server always wins
    (prevents race conditions on critical state transitions)
  - For editable fields (dueDate, purpose): merge strategy
    (client changes applied if no server conflict on that field)

Sync Queue Schema:
  {
    id: "sq_abc123",
    type: "CREATE_LOAN" | "UPDATE_LOAN" | "RECORD_PAYMENT" | "FORGIVE_LOAN",
    endpoint: "/v1/loans",
    method: "POST" | "PATCH",
    body: { ... },
    localEntityId: "local_temp_id_123",
    clientTimestamp: "2026-08-11T14:35:00Z",
    status: "PENDING" | "IN_FLIGHT" | "COMPLETED" | "FAILED",
    serverResponse: null | { ... },
    retryCount: 0,
    createdAt: "2026-08-11T14:35:00Z"
  }
```

---

## 9. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml (conceptual)

name: LoanTrack CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ── Shared Setup ──
  setup:
    runs-on: ubuntu-latest
    outputs:
      cache-hit: ${{ steps.cache.outputs.cache-hit }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile

  # ── Lint & Type Check ──
  lint:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint          # ESLint across all packages
      - run: pnpm run typecheck     # tsc --noEmit across all packages
      - run: pnpm run format:check  # Prettier check

  # ── Unit Tests ──
  test:
    needs: setup
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_USER: test, POSTGRES_PASSWORD: test, POSTGRES_DB: loantrack_test }
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @loantrack/prisma run db:push
        env: { DATABASE_URL: "postgresql://test:test@localhost:5432/loantrack_test" }
      - run: pnpm run test -- --coverage
        env: { DATABASE_URL: "postgresql://test:test@localhost:5432/loantrack_test" }
      - uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage/ }

  # ── Build Mobile App ──
  build-mobile:
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm install -g eas-cli
      - run: eas build --platform all --profile production --non-interactive
        env: { EXPO_TOKEN: "${{ secrets.EXPO_TOKEN }}" }

  # ── OTA Update (EAS Update) ──
  deploy-ota:
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm install -g eas-cli
      - run: eas update --branch production --message "${{ github.event.head_commit.message }}"
        env: { EXPO_TOKEN: "${{ secrets.EXPO_TOKEN }}" }

  # ── Deploy API to Fly.io ──
  deploy-api:
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only --app loantrack-api
        env: { FLY_API_TOKEN: "${{ secrets.FLY_API_TOKEN }}" }

  # ── Database Migration ──
  migrate-db:
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @loantrack/prisma run db:migrate:deploy
        env: { DATABASE_URL: "${{ secrets.DATABASE_URL }}" }
```

### Build Pipeline Summary

| Stage | Tool | Trigger |
|---|---|---|
| Type Checking | `tsc --noEmit` | Every PR push |
| Linting | ESLint + Prettier | Every PR push |
| Unit Tests | Vitest + Supertest | Every PR push |
| API Deploy | Fly.io (`flyctl deploy`) | Merge to `main` |
| DB Migration | Prisma Migrate | Merge to `main` |
| OTA Update | EAS Update | Merge to `main` |
| App Build | EAS Build (`production` profile) | Release tag `v*` |
| App Store Submit | EAS Submit | Manual trigger (production) |

---

## 10. Security Architecture

### Defense-in-Depth Layers

```
Layer 1: Transport
  - TLS 1.3 enforced for all API traffic (Fly.io auto-SSL)
  - Certificate pinning in mobile app (optional, post-MVP)
  - HSTS headers with max-age=31536000

Layer 2: Authentication
  - Supabase GoTrue: Phone OTP → JWT (RS256)
  - Access token: 15 min TTL
  - Refresh token: 30 day TTL with rotation
  - Local PIN: bcrypt(cost=12) hash stored server-side
  - pinToken: 15 min TTL, scoped to device

Layer 3: Authorization
  - Supabase RLS policies on all tables:
    - users:     SELECT own row; INSERT on signup; UPDATE own row
    - loans:     SELECT where auth.uid() IN (lenderId, borrowerId)
    - payments:  SELECT where loan_id IN (user's loans)
    - trust_scores: SELECT where userId = auth.uid() OR isTrustScorePublic = true
    - relationship_edges: SELECT where sourceUserId = auth.uid()
    - All other tables: SELECT where userId = auth.uid()
  - Server-side ownership checks in Fastify as defense-in-depth

Layer 4: Input Validation
  - Zod schemas on ALL API inputs (client-side validation is cosmetic only)
  - Prisma parameterized queries (no SQL injection)
  - Phone number: E.164 format validation via libphonenumber-js
  - Amount: non-negative decimal, max 10 decimal places
  - String lengths enforced at schema level

Layer 5: Rate Limiting
  - Fastify rate-limit plugin backed by Upstash Redis
  - Auth endpoints: 5 req/min per IP (OTP brute-force protection)
  - General API: 100 req/min per authenticated user
  - OTP resend: 60sec cooldown
  - PIN attempts: 5 failures → 30min lockout

Layer 6: Data Encryption
  - Phone numbers: AES-256-GCM encryption at rest (application-level)
  - Phone hashes: SHA-256 + pepper for contact lookup
  - PIN hashes: bcrypt (cost=12)
  - IP addresses: encrypted at rest, auto-purged after 90 days
  - PostgreSQL: encrypted at rest (Supabase managed)
  - Backups: encrypted at rest

Layer 7: Secrets Management
  - All secrets in environment variables, never committed
  - Managed via Doppler (development) → GitHub Secrets (CI) → Fly.io Secrets (production)
  - Secrets include: DATABASE_URL, SUPABASE_SERVICE_KEY, TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN, FCM_SERVICE_ACCOUNT_JSON, UPSTASH_REDIS_URL,
    JWT_SIGNING_SECRET, PEPPER_SECRET, ENCRYPTION_KEY

Layer 8: Monitoring & Incident Response
  - Sentry: real-time error tracking with alerts
  - Firebase Crashlytics: mobile crash reporting
  - Fly.io metrics: API latency, error rate, instance health
  - Database: Supabase dashboard with query performance monitoring
  - Dependency scanning: GitHub Dependabot + `pnpm audit` in CI
  - Weekly automated security scan via Snyk
```

### Zod Validation Example

```typescript
// packages/api/src/schemas/loan.schema.ts
import { z } from 'zod';

export const createLoanSchema = z.object({
  borrowerPhone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Must be E.164 format'),
  amount: z.number().positive().max(9_999_999.99),
  currency: z.string().length(3).default('USD'),
  purpose: z.string().min(1).max(500),
  dueDate: z.string().datetime(),
  interestRate: z.number().min(0).max(100).default(0),
  collateralDescription: z.string().max(1000).nullable().default(null),
  templateId: z.string().uuid().nullable().default(null),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'VENMO', 'PAYPAL', 'CASHAPP', 'CRYPTO', 'OTHER']),
  note: z.string().max(500).optional(),
  purposeTag: z.string().max(200).optional(),
  paidAt: z.string().datetime().optional(),
});

export const forgiveLoanSchema = z.object({
  occasion: z.enum(['BIRTHDAY', 'HOLIDAY', 'ANNIVERSARY', 'GRADUATION', 'JUST_BECAUSE', 'CUSTOM']),
  message: z.string().max(200).optional(),
});
```

### RLS Policy Examples

```sql
-- Supabase RLS Policy: Users can only see their own loans
CREATE POLICY "Users can view own loans"
  ON loans FOR SELECT
  USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

-- Supabase RLS Policy: Only lender can edit a loan
CREATE POLICY "Lenders can update own loans"
  ON loans FOR UPDATE
  USING (auth.uid() = lender_id)
  WITH CHECK (auth.uid() = lender_id);

-- Supabase RLS Policy: Trust score visibility
CREATE POLICY "Trust score visibility"
  ON trust_scores FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = trust_scores.user_id
      AND users.is_trust_score_public = true
    )
  );
```

---

## 11. Deployment Architecture (VPS Docker Stack)

### Topology

```
┌─────────────────────────────────────────────────────────┐
│                    VPS (Ubuntu 22.04)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Docker Compose Stack                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │ Fastify  │  │  Redis 7 │  │ PostgreSQL 16    │ │  │
│  │  │ API      │  │  Alpine  │  │ Alpine            │ │  │
│  │  │ :3001    │  │  :6379   │  │ :5432             │ │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  Volume: ./data/postgres  (persistent DB)    │ │  │
│  │  │  Volume: ./data/redis     (persistent queue) │ │  │
│  │  │  Volume: ./uploads         (temp files)      │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
  ┌─────────────┐          ┌──────────────┐
  │ Firebase     │          │ SMS Provider │
  │ Storage      │          │ (Abstract)   │
  │ (free tier)  │          │              │
  │ IOU PDFs     │          │ Africa's     │
  │ Profile pics │          │ Talking      │
  └─────────────┘          │ (primary)    │
                           │ Twilio       │
                           │ (fallback)   │
                           └──────────────┘
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./packages/api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://loantrack:${DB_PASSWORD}@postgres:5432/loantrack
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - FCM_SERVICE_ACCOUNT=${FCM_SERVICE_ACCOUNT}
      - SMS_PROVIDER=africastalking
      - AT_USERNAME=${AT_USERNAME}
      - AT_API_KEY=${AT_API_KEY}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=loantrack
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=loantrack
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - ./data/redis:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
```

### DB Backup Strategy (pg_dump cron)

```bash
# Run via cron on VPS: 0 2 * * * /opt/loantrack/backup.sh
docker exec loantrack-postgres-1 pg_dump -U loantrack loantrack | gzip > /backups/loantrack-$(date +%Y%m%d).sql.gz
# Keep last 30 days, delete older
find /backups -name "loantrack-*.sql.gz" -mtime +30 -delete
```

---

## 12. File Storage (Firebase Storage)

### Why Firebase Storage
- Free tier: 5GB storage, 1GB/day download
- IOU PDFs (~50KB each) + profile photos (~200KB each)
- At 10,000 users: ~2.5GB total — well within free tier
- CDN-cached, auto-scaled
- Fallback: if costs grow, switch to local VPS volume mount

### Firebase Storage Setup

```typescript
// packages/api/src/lib/storage.ts
import { getStorage } from 'firebase-admin/storage';

const bucket = getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET);

export async function uploadFile(path: string, buffer: Buffer, contentType: string): Promise<string> {
  const file = bucket.file(path);
  await file.save(buffer, { contentType });
  // Generate signed URL valid for 7 days
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  return url;
}

export async function deleteFile(path: string): Promise<void> {
  await bucket.file(path).delete({ ignoreNotFound: true });
}
```

### Security Rules (Firebase Console)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /iou/{userId}/{loanId}.pdf {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
    }
    match /avatars/{userId}.{ext} {
      allow read: if true;
      allow create: if request.auth.uid == userId;
    }
  }
}
```

---

## 13. SMS Provider Abstraction Layer

### Strategy Pattern

```typescript
// packages/shared/src/sms/types.ts
export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface DeliveryStatus {
  delivered: boolean;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  deliveredAt?: string;
}

export interface SmsProvider {
  readonly name: string;
  send(phone: string, message: string, senderId?: string): Promise<SmsResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}
```

### Provider Registry

```typescript
// packages/api/src/sms/providers/registry.ts
import { AfricaTalkingProvider } from './africastalking';
import { TwilioProvider } from './twilio';

const providers: Record<string, SmsProvider> = {
  africastalking: new AfricaTalkingProvider(),
  twilio: new TwilioProvider(),
};

export function getSmsProvider(name?: string): SmsProvider {
  const providerName = name || process.env.SMS_PROVIDER || 'africastalking';
  const provider = providers[providerName];
  if (!provider) throw new Error(`Unknown SMS provider: ${providerName}`);
  return provider;
}
```

### Africa's Talking Provider (Primary)

```typescript
// packages/api/src/sms/providers/africastalking.ts
import AfricasTalking from 'africastalking';

export class AfricaTalkingProvider implements SmsProvider {
  readonly name = 'africastalking';
  private client: any;

  constructor() {
    this.client = AfricasTalking({
      apiKey: process.env.AT_API_KEY!,
      username: process.env.AT_USERNAME!,
    });
  }

  async send(phone: string, message: string, senderId?: string): Promise<SmsResult> {
    try {
      const result = await this.client.SMS.send({
        to: [phone],
        message,
        from: senderId || 'LOANTRACK',
      });
      const msg = result.SMSMessageData.Recipients[0];
      return {
        success: msg.status === 'Success',
        messageId: msg.messageId,
        provider: this.name,
      };
    } catch (error: any) {
      return { success: false, error: error.message, provider: this.name };
    }
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    // Africa's Talking doesn't have a status API — use delivery reports webhook
    return { delivered: true, status: 'delivered' };
  }
}
```

### Twilio Provider (Fallback)

```typescript
// packages/api/src/sms/providers/twilio.ts
import twilio from 'twilio';

export class TwilioProvider implements SmsProvider {
  readonly name = 'twilio';
  private client: any;

  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  }

  async send(phone: string, message: string): Promise<SmsResult> {
    try {
      const msg = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: phone,
      });
      return { success: true, messageId: msg.sid, provider: this.name };
    } catch (error: any) {
      return { success: false, error: error.message, provider: this.name };
    }
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    const msg = await this.client.messages(messageId).fetch();
    return { delivered: msg.status === 'delivered', status: msg.status as any };
  }
}
```

### Usage

```typescript
// API route: send reminder
const provider = getSmsProvider();
const result = await provider.send(loan.borrowerPhone, `Reminder: Your loan of ${loan.amount} XOF is due.`);
await logReminder(loan.id, result);
```

### Auto-Provider Selection by Country

```typescript
function selectProviderForCountry(phone: string): string {
  // African country codes → Africa's Talking
  const africanCodes = ['+226','+225','+221','+223','+233','+234','+254','+255','+256','+250'];
  const prefix = phone.substring(0, 4);
  return africanCodes.some(c => prefix.startsWith(c)) ? 'africastalking' : 'twilio';
}
```

### Adding a New Provider

1. Create `packages/api/src/sms/providers/newprovider.ts` implementing `SmsProvider`
2. Register in `registry.ts`
3. Set `SMS_PROVIDER=newprovider` in env

---

## 14. Africa / Burkina Faso Localization

### Language — French + English

```typescript
// packages/mobile/src/i18n/
// Uses react-i18next with JSON translation files

// fr.json (default for BF)
{
  "dashboard": {
    "title": "Tableau de bord",
    "activeLoans": "Prêts actifs",
    "totalOutstanding": "Total dû",
    "amount": "{{amount}} XOF"
  },
  "loan": {
    "create": "Nouveau prêt",
    "borrower": "Emprunteur",
    "amount": "Montant",
    "reason": "Raison",
    "dueDate": "Date d'échéance"
  },
  "reminders": {
    "escalation": {
      "friendly": "Rappel amical",
      "firm": "Rappel important",
      "meme": "Petit rappel humoristique 🙃"
    }
  }
}
```

### Currency

- Default: **XOF (CFA Franc)** for Burkina Faso
- Multi-currency support: USD, EUR, XOF, XAF, NGN, GHS, KES
- Stored as `DECIMAL(12,2)` in PostgreSQL with `currency` column
- Display formatted: `Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF' })`

### Phone Format

- International format: `+226 XX XX XX XX` (BF)
- Supabase Auth phone OTP uses E.164 format
- Africa's Talking expects `+226XXXXXXXX`

### Offline-First Priority

Given intermittent connectivity in parts of Burkina Faso:
- WatermelonDB stores all loans, payments, reminders locally
- TanStack Query with `staleTime: Infinity` and persistence
- Sync queue retries with exponential backoff (30s → 1min → 5min → 30min)
- All mutations available offline, synced when online
- User sees "Last synced: 2 min ago" indicator

### Provider Selection

- Africa's Talking auto-selected for `+226` (BF), `+225` (CI), `+221` (SN), etc.
- Twilio used for non-African numbers
- Cost: ~$0.02/SMS with Africa's Talking vs ~$0.0075/SMS with Twilio

---

## 15. Revised Monthly Cost Estimate (VPS Stack)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| VPS (Hetzner/OVH) | 4GB RAM, 2 vCPU | ~$15-25 |
| Docker containers | Self-hosted (API + Redis + PG) | $0 |
| Firebase Storage | Free tier (5GB) | $0 |
| Firebase FCM | Free | $0 |
| Africa's Talking SMS | Pay-as-you-go (~500 SMS) | ~$10 |
| Supabase Auth (phone OTP) | Free tier (100 OTPs/day) | $0 |
| EAS Build | Free tier (30 builds/mo) | $0 |
| GitHub Actions | Free (public repo) | $0 |
| **Total** | | **~$25-35/mo** |

Scaling: +$10-15/mo per 1,000 additional active users (mostly SMS costs).

---

*End of Architecture Document — maintained in `_bmad/planning-artifacts/architecture.md`*
