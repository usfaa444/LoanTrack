# Implementation Plan — LoanTrack

**Stack:** Turborepo + pnpm + Expo SDK 52 + Fastify v5 + Prisma + PostgreSQL (Docker) + Redis (Docker) + BullMQ
**Target:** VPS Docker stack. Africa's Talking (primary SMS) + Twilio (fallback)
**Scope:** All P0 + P1 features including Trust Score, IOU, Gifting, Streaks (built with core API)

## Phase 1 — Foundation
Monorepo scaffold, shared types, Prisma schema, Docker. ~40 files.

Key files: turbo.json, docker-compose.yml, packages/shared (types, SMS interface, utils), packages/database (Prisma schema 16 models), packages/api (Fastify app, config, plugins)

## Phase 2 — Auth
Supabase phone OTP, JWT middleware, local PIN. ~10 files.

Key files: packages/api/src/lib/supabase.ts, jwt.ts, crypto.ts, plugins/auth.ts, services/auth.service.ts, routes/auth/

## Phase 3 — Core API
Loans CRUD, payments, dashboard, trust score, IOU, gifting, streaks. ~45 files.

Key files: services (loan, payment, dashboard, trust, iou, gift, streak, notification, relationship), routes (loans, payments, dashboard, relationships, notifications, devices, users)

## Phase 4 — Reminders + SMS
BullMQ reminder engine, escalation ladder, SMS providers. ~15 files.

Key files: queue/ (connection, queues, workers, jobs), services/reminder.service.ts, sms/providers/ (africastalking.ts, twilio.ts, registry.ts), routes/webhooks/

## Phase 5 — Mobile App
Expo screens, navigation, API client, hooks, components. ~80 files.

Key files: app/(auth + tabs), components (LoanCard, PaymentTimeline, EscalationLadderEditor, TrustScoreBadge, HeatmapGraph, Confetti, PinPad, etc.), hooks, api client, stores

## Phase 6 — Polish
Offline sync (WatermelonDB), i18n (fr/en), CI/CD, tests, observability. ~40 files.

Key files: db/ (Watermelon schema, models, sync queue/engine), tests/, CI workflows, Sentry + Crashlytics + PostHog
