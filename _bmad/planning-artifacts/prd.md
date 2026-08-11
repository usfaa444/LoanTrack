# Product Requirements Document — LoanTrack

**Document Version:** 1.0  
**Date:** 2026-08-11  
**Status:** Draft  
**Author:** Product Team

---

## 1. Executive Summary & Vision Statement

### Vision Statement

> *"To be the most trusted personal loan manager on the planet — making lending between friends, family, and community members transparent, dignified, and friction-free."*

LoanTrack solves the universal pain of informal lending: awkwardness, forgotten debts, strained relationships, and disorganized tracking. Whether it's splitting a dinner bill, lending rent money to a cousin, or tracking multi-person group loans, LoanTrack replaces spreadsheets, sticky notes, and uncomfortable text messages with a beautiful, gamified, and intelligent platform.

### Core Value Propositions

| Pillar | Description |
|---|---|
| **Clarity** | Every loan is documented with terms, timelines, and status — no more "I thought you said next month" moments. |
| **Trust** | Trust Scores, Digital IOUs, and Relationship Heatmaps turn reputation into measurable data. |
| **Dignity** | Gentle escalation ladders, borrower-chosen reminder timing, and third-party nudges preserve relationships. |
| **Delight** | Gamification (streaks, badges, confetti), Loan Gifting, and shareable repayment cards make finance unexpectedly fun. |

### Platform Philosophy

- **Mobile-first, offline-first.** LoanTrack works anywhere — subways, rural areas, airplane mode.
- **Free forever for core features.** Monetization via optional premium tiers: Loan Shield insurance, Premium Analytics, Legal Document Generation.
- **Privacy by design.** Loan data is end-to-end encrypted at rest. No social graph data is sold or shared.
- **Not a bank, not a legal advisor.** LoanTrack facilitates tracking and communication. It is not a party to any loan agreement.

---

## 2. Target Users & Personas

### Persona 1: Priya — The Frequent Lender

| Attribute | Detail |
|---|---|
| **Age** | 29 |
| **Occupation** | Product Manager at a tech startup |
| **Annual Income** | $95,000 |
| **Location** | Urban, San Francisco |
| **Tech Savviness** | High |
| **Pain Points** | Has 8-12 active loans at any time (friends, coworkers, family). Loses track of who owes what. Feels awkward reminding people. Hates spreadsheets. |
| **Goals** | Track everything in one place. Automate reminders so she doesn't have to be the "bad guy." Know who is reliable before lending again. |
| **Behaviors** | Checks app daily. Wants push notifications. Willing to pay for Premium Analytics to understand her lending portfolio. |
| **Favorite Features** | Trust Score, Gentle Escalation Ladder, Loan Portfolio Dashboard, Relationship Heatmap |

### Persona 2: Marcus — The Casual Borrower

| Attribute | Detail |
|---|---|
| **Age** | 23 |
| **Occupation** | Graduate Student / Part-time Bartender |
| **Annual Income** | $28,000 |
| **Location** | College town, Austin TX |
| **Tech Savviness** | Medium |
| **Pain Points** | Borrows small amounts frequently ($20-$100). Forgets due dates. Feels embarrassed when friends have to remind him. Wants to build a reputation as reliable. |
| **Goals** | See all his debts in one place. Get reminders that don't feel accusatory. Build his Trust Score so friends lend to him without hesitation. Celebrate being debt-free. |
| **Behaviors** | Opens app 2-3 times per week. Prefers SMS reminders over push notifications. Uses Loan-Free Streaks as motivation. |
| **Favorite Features** | Loan-Free Streaks, Repayment Countdown Clock, Digital IOU, Loan Gifting (when someone forgives his debt as a birthday present) |

### Persona 3: Aisha — The Group Organizer

| Attribute | Detail |
|---|---|
| **Age** | 34 |
| **Occupation** | High School Teacher & Community Volunteer |
| **Annual Income** | $58,000 |
| **Location** | Suburban, Atlanta GA |
| **Tech Savviness** | Medium-Low |
| **Pain Points** | Manages shared expenses for a 5-person volunteer group and a 4-person family trip fund. Tracking who owes whom after group dinners is a nightmare. Everyone uses different apps (Venmo, WhatsApp, cash). |
| **Goals** | Simplify group lending with one system. See net balances within her circle. Generate shareable summaries after group events. |
| **Behaviors** | Uses the app in bursts (around trips, events, monthly group meetings). Prefers simple UI. Wants printable Digital IOUs. |
| **Favorite Features** | Loan Circles, Settle Up Party Mode, Shareable Loan Cards, Digital IOU with signatures |

---

## 3. Functional Requirements

### 3.1 Authentication & Onboarding

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-001 | Phone OTP Authentication | P0 | Users sign up/login via phone number + SMS OTP delivered through Twilio Verify. Supabase Auth handles session management and JWT issuance. |
| FR-002 | Local PIN / Biometric Lock | P0 | After initial phone auth, users set a 4-6 digit local PIN. On subsequent app opens, authenticate via PIN or biometrics (FaceID / TouchID / Android Biometric) without re-entering OTP. |
| FR-003 | Session Persistence | P0 | JWT refresh tokens managed by Supabase. App stays logged in for 30 days; auto-logout requires re-auth. |
| FR-004 | Profile Setup | P0 | After first login, user sets display name, avatar (photo or emoji), and default currency (USD, EUR, INR, etc.). Phone number is the primary identity. |

### 3.2 Loan CRUD

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-005 | Create Loan | P0 | Lender creates a loan by entering: borrower phone number (or selecting from contacts/friends), amount, currency, purpose/description, due date, optional interest rate (0% default), optional collateral description. System sends SMS/notification to borrower inviting them to the platform. |
| FR-006 | View Loan Detail | P0 | Full loan detail view shows: amount, remaining balance, lender name, borrower name, purpose, created date, due date, status (ACTIVE / PAID / OVERDUE / FORGIVEN / DISPUTED), payment history timeline, attached receipts/photos, Digital IOU link. |
| FR-007 | Edit Loan | P0 | Lender can edit: amount (only before borrower accepts), due date, purpose, notes. Changes are logged in an audit trail visible to both parties. Borrower must acknowledge changes. |
| FR-008 | Delete/Cancel Loan | P1 | Lender can cancel a loan only if no payments have been made and borrower hasn't accepted yet. Soft-delete with 30-day recovery window. |
| FR-009 | Loan Acceptance | P0 | Borrower receives notification when a loan is created. Must accept or dispute within 72 hours. Acceptance requires PIN/biometric confirmation. |
| FR-010 | Loan Dispute | P2 | Either party can flag a loan as disputed. Freezes status, prevents automatic reminders, opens an in-app chat for resolution. |
| FR-011 | Loan Bundles (Group Lending) | P2 | Multiple lenders contribute to one borrower. System tracks proportional repayment shares. Each lender sees only their share. Borrower sees total obligation. |
| FR-012 | Recurring Loan Templates | P1 | Users save reusable loan templates (e.g., "Monthly dinner split with Mike") with preset: counterparty, amount, category, reminder preferences. One-tap to instantiate. |
| FR-013 | Attachments / Receipts | P1 | Upload photos, voice memos, or documents as attachments to a loan (e.g., photo of cash handover, screenshot of bank transfer). Stored in Supabase Storage. |

### 3.3 Payment Tracking

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-014 | Record Full Payment | P0 | Lender (or borrower with lender confirmation) marks a loan as fully paid. Triggers celebration animation (confetti + sound), updates both parties' Trust Scores, and moves loan to PAID status. |
| FR-015 | Record Partial Payment | P0 | Either party can log a partial payment with amount, date, method (cash, bank transfer, Venmo, etc.), and optional purpose tag (e.g., "paying back the rent portion first"). Remaining balance auto-calculated. |
| FR-016 | Payment History Timeline | P0 | Each loan displays a chronological timeline of all payments with amounts, dates, methods, and confirmation status. Visual progress bar showing % repaid. |
| FR-017 | Status State Machine | P0 | Strict state transitions: `ACTIVE → PAID` (full payment), `ACTIVE → OVERDUE` (past due date), `OVERDUE → PAID` (late full payment), `ACTIVE → FORGIVEN` (loan gifting), `ACTIVE → DISPUTED`, `DISPUTED → ACTIVE` (resolution). Invalid transitions are blocked server-side. |
| FR-018 | Biometric Payment Confirmation | P2 | For high-value loans (>$500), both parties must verify with biometrics when marking as paid. Creates a tamper-proof audit trail. |

### 3.4 Smart Reminders (Feature #8 — Gentle Escalation Ladder)

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-019 | Escalation Ladder Configuration | P0 | Lender configures a 4-stage reminder ladder with customizable timing and tone. Default: Stage 1 (1 day before due) = "Friendly nudge", Stage 2 (due date) = "Polite reminder", Stage 3 (7 days overdue) = "Firmer with impact note", Stage 4 (14 days overdue) = "Serious + funny meme/gif". Each stage has configurable delay, message template, delivery channel (push/SMS/email), and tone. |
| FR-020 | Escalation State Tracking | P0 | System persists which stage each overdue loan is in. Automatically advances when timer elapses for current stage. Stops escalation on payment or dispute. Resets on new due date if loan is extended. |
| FR-021 | Custom Message Templates | P1 | Users can write custom messages for each escalation stage using variable substitution: `{borrower_name}`, `{amount}`, `{purpose}`, `{days_overdue}`, `{due_date}`. Pre-built template library included. |
| FR-022 | Stage 4 Meme Injection | P1 | For the final escalation stage, system selects a randomized funny meme/gif from a curated library (e.g., "I'm not saying you forgot, but even my goldfish remembers..."). Categories include: funny, sarcastic, wholesome, pop-culture. User can opt out. |
| FR-023 | Borrower Reminder Preferences | P1 | Borrower can set their preferred reminder time windows (e.g., "Only remind me after 6 PM" or "Never on Sundays"). System merges lender escalation schedule with borrower preferences. |
| FR-024 | Third-Party Reminder Mode | P2 | Reminders can be sent from "LoanTrack Assistant" rather than the lender's name, reducing social awkwardness. Toggle per-loan. |
| FR-025 | Manual Reminder Override | P0 | Lender can manually send a reminder at any stage, bypassing the automatic schedule. Logged in audit trail. |

### 3.5 Trust Score (Feature #14)

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-026 | Trust Score Calculation Engine | P0 | Every user has a Trust Score from 0-1000. Calculation algorithm: `score = base(300) + repayment_bonus - default_penalty + tenure_bonus + volume_bonus + badge_bonus`. Repayment bonus: +5 per on-time repayment, +2 per late-but-complete repayment. Default penalty: -15 per overdue >30 days, -50 per unresolved default. Tenure bonus: +1 per month active (capped at 100). Volume bonus: logarithmic scale based on total loan volume. All scores clamped to [0, 1000]. |
| FR-027 | Trust Score Events | P0 | Every score-affecting event is logged immutably: on-time repayment, late payment, default, dispute resolved positively, dispute resolved negatively, loan forgiven, streak milestone achieved. Each event has: type, point delta, new score, timestamp, associated loan ID. |
| FR-028 | Trust Score Tier & Badges | P0 | Score ranges mapped to tiers: 0-199 = "Untrusted" (red), 200-399 = "Building" (orange), 400-599 = "Reliable" (yellow), 600-799 = "Trusted" (green), 800-1000 = "Exemplary" (gold). Badge unlocks at tier thresholds: "First Repayment" at first on-time pay, "Ironclad" at 800+, "Centurion" at 100 on-time repayments. |
| FR-029 | Trust Score Visibility | P0 | Users can see their own Trust Score dashboard with event history. When creating a new loan, lender sees borrower's score (if borrower has opted into public visibility). Default: private, opt-in to public. |
| FR-030 | Trust Score Recalculation | P1 | Scheduled nightly recalculation for all users. Also triggered in real-time on payment events. Idempotent — running twice produces same result. |

### 3.6 Relationship Heatmap (Feature #21)

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-031 | Relationship Graph Data Model | P1 | Each lending relationship between two users is an edge in a directed graph: `{source: lender_id, target: borrower_id, total_lent, total_repaid, loan_count, on_time_count, avg_repayment_days, last_interaction}`. Edges update on every loan/payment event. |
| FR-032 | Heatmap Visualization | P1 | Interactive force-directed graph rendered on the Dashboard. Nodes = users (size = total lending volume, color = Trust Score tier). Edges = relationships (thickness = loan count, color gradient = repayment quality: green = mostly on-time, yellow = mixed, red = mostly late). Tap a node to filter. |
| FR-033 | Heatmap Filters & Time Range | P2 | Filter by time range (last 30/90/365 days, all time), by relationship direction (money I lent vs. money I borrowed), by amount range. |
| FR-034 | Top Relationships Widget | P1 | Simplified list view alternative: "Your Top 5 Relationships" ranked by total volume, showing on-time %, average repayment speed, and last interaction date. |

### 3.7 Digital IOU (Feature #34)

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-035 | Digital IOU Generation | P1 | Generate a styled PDF document for any loan containing: lender name & signature, borrower name & signature, loan amount (numeric + words), date issued, due date, purpose, interest rate (if any), repayment terms, unique IOU ID, tamper-proof QR code linking to verification page, timestamp. |
| FR-036 | Digital Signature Capture | P1 | Both parties sign the IOU by drawing their signature on a canvas (mobile) or typing and selecting a handwriting font. Signatures are embedded as vector graphics in the PDF. |
| FR-037 | IOU Party Management | P1 | Each IOU stores structured data for both parties: full legal name, phone number, signature image URL, signed timestamp, IP address (optional), device info. |
| FR-038 | IOU Verification | P2 | Each IOU has a unique public verification URL (`/verify/{iouId}`). Anyone with the link can verify the IOU's authenticity and current status without seeing unrelated loan data. |
| FR-039 | IOU Download & Share | P1 | Download as PDF to device. Share directly via system share sheet (WhatsApp, email, AirDrop). Option to print via AirPrint / Google Cloud Print. |

### 3.8 Loan-Free Streaks (Feature #29)

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-040 | Streak Tracking | P1 | Daily cron job calculates consecutive days without creating a new loan (as borrower). Streak starts at 0 and increments by 1 each day no new loan is created. Creating a new loan resets streak to 0. Paying off existing loans does not break the streak. |
| FR-041 | Streak Milestones & Badges | P1 | Milestone thresholds: 7 days = "Week of Freedom" badge, 30 days = "Monthly Mastery", 90 days = "Quarterly Champion", 180 days = "Half-Year Hero", 365 days = "Debt-Free Legend". Each milestone triggers push notification with celebration animation. |
| FR-042 | Streak Leaderboard | P2 | Friends can opt-in to a streak leaderboard. Displays top 10 friends by current streak length. Refreshes daily. |

### 3.9 Loan Gifting (Feature #52)

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-043 | Forgive Loan Flow | P1 | Lender can forgive/waive any active loan. Flow: (1) tap "Gift this loan", (2) select occasion (birthday, holiday, "just because", custom), (3) optionally add a personal message, (4) confirm with PIN/biometric. Loan status changes to FORGIVEN immediately. |
| FR-044 | Gift Celebration Notification | P1 | Borrower receives a festive push notification + SMS: "🎉 [Lender] forgave your [$amount] loan! [Occasion emoji] [Personal message]" Confetti animation on app open. Shareable celebration card generated. |
| FR-045 | Gift History | P1 | Both parties can see all forgiven loans in their history. Forgiven loans appear in a dedicated "Gifts" section distinct from active/paid loans. Affects Trust Score: lender gets +10 points (generosity bonus), borrower gets 0 (neutral — not a repayment). |

### 3.10 Notifications & Communication

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-046 | Push Notifications (FCM) | P0 | Firebase Cloud Messaging delivers push notifications for: loan created, payment received, reminder sent, loan overdue, loan gifted, streak milestone, trust score tier change. Users configure notification preferences per category. |
| FR-047 | SMS via Twilio | P0 | SMS fallback for critical events when push token is unavailable or push delivery fails. Used primarily for: initial loan invitation (non-user borrowers), overdue reminders at stages 3-4, loan gifted notification. |
| FR-048 | In-App Notification Center | P1 | Persistent notification bell in the app header. Displays chronological list of all notifications. Mark-as-read, swipe-to-dismiss. Groups related notifications (e.g., "3 reminders for Loan #42"). |
| FR-049 | Notification Preferences | P1 | Granular toggles per notification type: payment confirmations, reminders, trust score updates, streak milestones, promotional. Per-channel toggles: push, SMS, email. Quiet hours setting (e.g., 10 PM - 8 AM). |

### 3.11 Dashboard & Analytics

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-050 | Main Dashboard | P0 | Home screen displays: summary cards (Active Loans count, Total Outstanding, Total Lent All-Time, Total Repaid), upcoming due dates list (next 7 days), quick-add loan FAB, Trust Score with trend arrow, current Loan-Free Streak badge. |
| FR-051 | Loan Portfolio View | P1 | Filterable/sortable list of all loans with tabs: Active, Overdue, Paid, Forgiven. Each loan card shows: counterparty avatar, amount, remaining, due date, status badge, mini progress bar. |
| FR-052 | Search & Filter | P1 | Search loans by counterparty name, purpose, or amount. Filter by status, date range, amount range. Sort by due date, amount, counterparty name. |
| FR-053 | Export Data | P2 | Export loan history as CSV or PDF report. Date range picker. Includes all loan fields and payment history. Premium feature. |

### 3.12 Offline Support

| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-054 | Offline CRUD | P0 | Users can create, view, edit, and mark payments on loans while offline. All mutations are queued in local SQLite (via expo-sqlite / WatermelonDB) and synced when connectivity returns. Conflict resolution via last-write-wins with server timestamp anchoring. |
| FR-055 | Offline Indicators | P1 | UI shows connectivity status badge. Pending sync count displayed. Swipe-to-refresh triggers manual sync. |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| NFR | Requirement | Target |
|---|---|---|
| NFR-P1 | API Response Time (p95) | < 200ms for reads, < 500ms for writes |
| NFR-P2 | App Cold Start Time | < 2 seconds on mid-range device |
| NFR-P3 | Push Notification Delivery | < 5 seconds from server event to device display (p95) |
| NFR-P4 | Heatmap Rendering | < 3 seconds for up to 200 nodes/500 edges |
| NFR-P5 | PDF IOU Generation | < 5 seconds from request to download-ready |
| NFR-P6 | Database Query Performance | All queries must use indexes; no full table scans on tables > 10K rows |

### 4.2 Security

| NFR | Requirement |
|---|---|
| NFR-S1 | All API traffic encrypted via TLS 1.3 |
| NFR-S2 | JWTs signed with RS256; access tokens expire in 15 minutes, refresh tokens in 30 days |
| NFR-S3 | Row-Level Security (RLS) enforced on Supabase — users can only access their own loans and relationships |
| NFR-S4 | All inputs validated server-side with Zod schemas — no client-only validation trust |
| NFR-S5 | Local PIN stored as bcrypt hash in device keychain (iOS Keychain / Android Keystore) |
| NFR-S6 | Rate limiting: 100 req/min per authenticated user, 10 req/min per IP on auth endpoints |
| NFR-S7 | Phone numbers hashed at rest (SHA-256 with pepper) for contact lookup; full number encrypted with AES-256-GCM |
| NFR-S8 | SQL injection prevented via Prisma parameterized queries; XSS prevented via output encoding |
| NFR-S9 | Secrets (API keys, DB URLs, signing keys) stored in environment variables; never committed; managed via Doppler / GitHub Secrets |
| NFR-S10 | Penetration testing performed before v1.0 launch; dependency vulnerability scanning in CI |

### 4.3 Scalability

| NFR | Requirement |
|---|---|
| NFR-SC1 | Stateless API servers — horizontal scaling on Fly.io with auto-scaling based on CPU > 70% |
| NFR-SC2 | Database connection pooling via PgBouncer (Supabase managed) |
| NFR-SC3 | Redis (Upstash) used for session caching, rate limiting, and BullMQ job queues |
| NFR-SC4 | Background jobs (reminders, score recalc, streak calc) processed by BullMQ workers — isolated from API servers |
| NFR-SC5 | CDN for static assets (PDFs, images) via Supabase Storage CDN |
| NFR-SC6 | Target: support 100K DAU with < 500ms p95 latency |

### 4.4 Accessibility

| NFR | Requirement |
|---|---|
| NFR-A1 | WCAG 2.1 AA compliance for all screens |
| NFR-A2 | Minimum touch target size 44x44pt |
| NFR-A3 | Color contrast ratio >= 4.5:1 for text, >= 3:1 for large text |
| NFR-A4 | Screen reader support (TalkBack / VoiceOver) for all interactive elements |
| NFR-A5 | Support dynamic type / font scaling up to 200% |

### 4.5 Offline & Reliability

| NFR | Requirement |
|---|---|
| NFR-O1 | App must be fully functional (read + write) when offline for up to 7 days |
| NFR-O2 | Sync queue persists across app restarts |
| NFR-O3 | Conflict resolution strategy: server timestamp wins for status changes; merge strategy for editable fields |
| NFR-O4 | API uptime target: 99.9% (43 minutes downtime/month max) |
| NFR-O5 | Automated database backups every 6 hours via Supabase; 30-day retention |

### 4.6 Data Privacy & Compliance

| NFR | Requirement |
|---|---|
| NFR-DP1 | GDPR-compliant: right to access, right to erasure, data portability (export all user data as JSON within 30 days of request) |
| NFR-DP2 | Data residency: user data stored in region closest to user (US, EU, IN) — initially US-East only, expand post-MVP |
| NFR-DP3 | PII (phone numbers, names) encrypted at rest |
| NFR-DP4 | Audit log of all data access and mutations retained for 90 days |
| NFR-DP5 | No tracking SDKs that share data with third parties without explicit consent |
| NFR-DP6 | Clear in-app disclaimer: "LoanTrack is a tracking tool, not a financial institution or legal service. LoanTrack is not a party to any loan agreement." |

---

## 5. User Stories

### Epic: Authentication

**US-001: Phone Sign-Up**  
*As a new user, I want to sign up with my phone number and a one-time code, so that I can start tracking loans without creating a password.*  
**Acceptance Criteria:**
- [ ] Enter phone number → receive SMS with 6-digit OTP within 30 seconds
- [ ] Enter correct OTP → account created, prompted to set display name and avatar
- [ ] Enter incorrect OTP → error message, option to resend (cooldown: 60 seconds)
- [ ] Invalid phone number format → inline validation error

**US-002: Quick App Unlock**  
*As a returning user, I want to unlock the app with my PIN or fingerprint, so that I can quickly check my loans without typing a password.*  
**Acceptance Criteria:**
- [ ] After initial login, app prompts to set a 4-6 digit PIN
- [ ] Subsequent opens show PIN pad (or biometric prompt if enabled)
- [ ] Correct PIN/biometric → app unlocks immediately (< 1 second)
- [ ] 5 incorrect PIN attempts → require phone OTP re-auth
- [ ] "Forgot PIN" option triggers OTP re-auth and PIN reset

### Epic: Loan Management

**US-003: Create a Loan**  
*As a lender, I want to quickly create a loan by entering the borrower's phone number, amount, and due date, so that I have a record of what I'm owed.*  
**Acceptance Criteria:**
- [ ] Tap "+" FAB → loan creation form opens
- [ ] Enter borrower phone → auto-lookup existing users; if not found, invite via SMS
- [ ] Enter amount (numeric keypad with currency prefix), purpose, due date (date picker)
- [ ] Optional: interest rate, collateral notes, photo attachments
- [ ] Submit → loan created with ACTIVE status, borrower notified
- [ ] Loan appears in lender's Active tab immediately

**US-004: View and Manage Loans**  
*As a user, I want to see all my loans in one place, filtered by status, so that I know my total outstanding and upcoming due dates.*  
**Acceptance Criteria:**
- [ ] Dashboard shows summary: Active count, Total Outstanding, Upcoming due dates
- [ ] Loans tab with filterable views: All, Active, Overdue, Paid, Forgiven
- [ ] Each loan card shows counterparty, amount, remaining, and due date
- [ ] Tap loan → full detail view with payment history timeline
- [ ] Search by counterparty name or purpose

**US-005: Record a Payment**  
*As a lender, I want to record when a borrower pays me back (partially or fully), so that the loan balance stays accurate.*  
**Acceptance Criteria:**
- [ ] From loan detail → tap "Record Payment"
- [ ] Enter: amount, date (defaults to today), method (cash/transfer/Venmo/other), optional note
- [ ] Partial payment → remaining balance updated, loan stays ACTIVE
- [ ] Full payment → loan status → PAID, confetti animation, Trust Score updated
- [ ] Payment appears in loan timeline immediately

**US-006: Handle Overdue Loans**  
*As a lender, I want loans past their due date to be clearly flagged, so that I know which ones need follow-up.*  
**Acceptance Criteria:**
- [ ] Loans past due date auto-transition to OVERDUE status
- [ ] OVERDUE loans sorted to top of Active list with red highlight
- [ ] Days overdue displayed prominently (e.g., "12 days overdue")
- [ ] Escalation reminders trigger automatically per configured ladder
- [ ] Extending due date is possible (both parties notified)

### Epic: Smart Reminders

**US-007: Configure Escalation Ladder**  
*As a lender, I want reminders to escalate automatically from friendly to firm over time, so that I don't have to manually follow up.*  
**Acceptance Criteria:**
- [ ] Settings → Reminders → Escalation Ladder shows 4 configurable stages
- [ ] Each stage: delay (days), tone label, message template, channel (push/SMS), enabled toggle
- [ ] Variables supported: {borrower_name}, {amount}, {purpose}, {days_overdue}
- [ ] Preview renders template with sample data
- [ ] Default ladder pre-configured; user can customize or reset to defaults

**US-008: Receive Automated Reminders (Borrower)**  
*As a borrower, I want to receive reminders that start friendly and gradually become more direct, so that I'm nudged to repay without feeling harassed.*  
**Acceptance Criteria:**
- [ ] Receive Stage 1 push notification 1 day before due: "Hey {name}! Just a heads-up about {amount} for {purpose}. No rush!"
- [ ] Receive Stage 2 on due date: polite reminder about due date
- [ ] Receive Stage 3 at 7 days overdue: firmer tone mentioning impact on Trust Score
- [ ] Receive Stage 4 at 14 days overdue: serious note + randomized funny meme image in notification
- [ ] Can set preferred reminder hours in settings

### Epic: Trust Score

**US-009: View My Trust Score**  
*As a user, I want to see my Trust Score and understand what affects it, so that I can build a strong reputation.*  
**Acceptance Criteria:**
- [ ] Dashboard shows current Trust Score with color-coded tier badge
- [ ] Tap score → detailed breakdown: base score, repayment history, tenure, penalties
- [ ] Event log shows recent score changes with reasons
- [ ] "How to improve" tips displayed for scores below 600

**US-010: Check Borrower Trust Before Lending**  
*As a lender, I want to see a potential borrower's Trust Score before lending, so that I can make informed decisions.*  
**Acceptance Criteria:**
- [ ] When creating a loan, if borrower is an existing user, their Trust Score tier is displayed
- [ ] If score is "Untrusted" or "Building," a gentle caution note appears
- [ ] Does NOT show detailed score breakdown (privacy); only tier and on-time repayment %
- [ ] Score is only visible if borrower has enabled public visibility

### Epic: Relationship Heatmap

**US-011: Explore My Lending Relationships**  
*As a user, I want to see a visual heatmap of who I lend to and borrow from, so that I understand my lending patterns.*  
**Acceptance Criteria:**
- [ ] Navigate to "Relationships" tab → force-directed graph renders
- [ ] My node is centered; connected nodes are people I've lent to/borrowed from
- [ ] Node size = total volume; node color = trust tier; edge thickness = loan count
- [ ] Tap a node → shows relationship summary: total lent, on-time %, avg repayment days
- [ ] Pinch-to-zoom, drag-to-pan; works on mobile

**US-012: View Top Relationships Summary**  
*As a user, I want a simple list of my most active lending relationships, so that I can quickly see who I interact with most.*  
**Acceptance Criteria:**
- [ ] Below heatmap or as alternative view: "Top 5 Relationships" list
- [ ] Each row: avatar, name, total lent, on-time %, last interaction date
- [ ] Sortable by: total volume, on-time %, most recent

### Epic: Digital IOU

**US-013: Generate a Digital IOU**  
*As a lender, I want to generate a formal IOU document for a loan that both parties can sign, so that there's a clear record of the agreement.*  
**Acceptance Criteria:**
- [ ] From loan detail → "Generate IOU" → preview screen
- [ ] Document displays: both parties' names, amount (numeric + words), dates, terms
- [ ] Each party draws or types their signature on canvas
- [ ] Both signatures captured → IOU locked, PDF generated
- [ ] Download and share options available

**US-014: Verify a Digital IOU**  
*As an IOU holder, I want to verify an IOU's authenticity using the QR code or link, so that I can confirm it hasn't been tampered with.*  
**Acceptance Criteria:**
- [ ] Scan QR code or open verification URL → loads IOU verification page
- [ ] Page shows: IOU ID, parties, amount, dates, status, "Verified" badge
- [ ] If IOU has been modified (loan paid/forgiven), status reflects current state
- [ ] Verification page does not expose any other user data

### Epic: Loan-Free Streaks

**US-015: Track My Loan-Free Streak**  
*As a borrower, I want to see how many consecutive days I've gone without taking new loans, so that I'm motivated to stay debt-free.*  
**Acceptance Criteria:**
- [ ] Dashboard shows current streak count with flame emoji (🔥 23 days)
- [ ] Creating a new loan resets streak to 0 with a gentle notification
- [ ] Paying off existing loans does NOT reset the streak
- [ ] Milestones (7, 30, 90, 180, 365 days) trigger celebration notifications + badges

**US-016: Earn Milestone Badges**  
*As a user, I want to earn badges for reaching loan-free milestones, so that I feel recognized for responsible borrowing.*  
**Acceptance Criteria:**
- [ ] Badge awarded at each milestone automatically
- [ ] Badge notification includes animation and shareable card
- [ ] All earned badges visible in Profile → Achievements
- [ ] Streak leaderboard (opt-in) shows friends' streaks

### Epic: Loan Gifting

**US-017: Forgive a Loan as a Gift**  
*As a lender, I want to forgive a loan as a gift for a special occasion, so that I can turn a debt into a generous gesture.*  
**Acceptance Criteria:**
- [ ] From loan detail → "Gift this loan" → occasion picker (birthday, holiday, custom)
- [ ] Optional personal message (200 chars max)
- [ ] Confirm with PIN/biometric → loan status → FORGIVEN
- [ ] Forgiven loans appear in a separate "Gifts" section
- [ ] Cannot be undone (explicit confirmation required)

**US-018: Receive a Loan Gift**  
*As a borrower, I want to be notified when a lender forgives my loan, so that I can celebrate the generous gesture.*  
**Acceptance Criteria:**
- [ ] Receive push notification: "🎉 {lender} forgave your {amount} loan! {occasion} {message}"
- [ ] SMS fallback sent if push unavailable
- [ ] Open notification → confetti animation, celebration card displayed
- [ ] Share celebration card via system share sheet
- [ ] Loan moves from Active to Forgiven; Trust Score unaffected for borrower

---

## 6. Feature Priority Matrix

### P0 — Must-Have (MVP v1.0 Core)

| Feature | FR IDs |
|---|---|
| Phone OTP Authentication | FR-001, FR-002, FR-003, FR-004 |
| Loan CRUD (create, view, edit) | FR-005, FR-006, FR-007 |
| Loan Acceptance | FR-009 |
| Payment Tracking (full + partial) | FR-014, FR-015, FR-016, FR-017 |
| Escalation Ladder Engine (core) | FR-019, FR-020, FR-025 |
| Trust Score Calculation | FR-026, FR-027, FR-028, FR-029 |
| Main Dashboard | FR-050 |
| Push Notifications (FCM) | FR-046 |
| SMS Fallback (Twilio) | FR-047 |
| Offline CRUD | FR-054 |
| Status State Machine | FR-017 |

### P1 — Should-Have (MVP v1.0 Extended)

| Feature | FR IDs |
|---|---|
| Delete/Cancel Loan | FR-008 |
| Recurring Loan Templates | FR-012 |
| Attachments / Receipts | FR-013 |
| Custom Message Templates for Reminders | FR-021 |
| Stage 4 Meme Injection | FR-022 |
| Borrower Reminder Preferences | FR-023 |
| Trust Score Recalculation | FR-030 |
| Relationship Heatmap (graph + top list) | FR-031, FR-032, FR-034 |
| Digital IOU Generation + Signatures | FR-035, FR-036, FR-037 |
| Loan-Free Streak Tracking + Milestones | FR-040, FR-041 |
| Loan Gifting (forgive + celebrate) | FR-043, FR-044, FR-045 |
| In-App Notification Center | FR-048 |
| Notification Preferences | FR-049 |
| Loan Portfolio View | FR-051 |
| Search & Filter | FR-052 |
| Offline Indicators | FR-055 |
| IOU Download & Share | FR-039 |

### P2 — Nice-to-Have (Post-MVP)

| Feature | FR IDs |
|---|---|
| Loan Dispute | FR-010 |
| Loan Bundles (Group Lending) | FR-011 |
| Biometric Payment Confirmation | FR-018 |
| Third-Party Reminder Mode | FR-024 |
| Heatmap Filters & Time Range | FR-033 |
| IOU Verification Page | FR-038 |
| Streak Leaderboard | FR-042 |
| Export Data (CSV/PDF) | FR-053 |
| AI-Generated Reminder Messages (Feature #13) | — |
| WhatsApp Bot Integration (Feature #24) | — |
| Bank SMS Parsing (Feature #26) | — |
| Splitwise/Venmo Sync (Feature #27) | — |
| Loan Shield Insurance (Feature #44) | — |
| Premium Analytics (Feature #45) | — |
| Multi-Currency & Crypto (Feature #48) | — |

---

## 7. MVP Scope

### v1.0 Release Definition

MVP v1.0 ships with **all P0 features + all P1 features** listed above. This delivers a fully functional personal loan tracker with:

- Complete authentication and profile management
- Full loan lifecycle (create → accept → pay → archive)
- Smart escalation reminders with customizable templates and meme injection
- Trust Score system with events, badges, and tier visualization
- Relationship Heatmap with interactive graph visualization
- Digital IOU generation with dual-party signatures and PDF export
- Loan-Free Streaks with milestone badges and celebrations
- Loan Gifting with festive notifications and shareable cards
- Push notifications + SMS delivery
- Offline-first architecture with sync
- Dashboard with portfolio analytics

### Out of Scope for v1.0

- Group lending (Loan Bundles)
- Loan Shield insurance
- WhatsApp/Messenger bot
- Bank SMS parsing
- Splitwise/Venmo integration
- Multi-currency & crypto
- Premium Analytics
- Legal document generation
- AI-generated reminder messages

### v1.1 (3 months post-launch)
- Loan Bundles
- Export Data
- Third-Party Reminder Mode
- Streak Leaderboard

---

## 8. Success Metrics

| Metric | Target (6 months) | Measurement Method |
|---|---|---|
| **DAU (Daily Active Users)** | 5,000 | Firebase Analytics / Mixpanel |
| **MAU (Monthly Active Users)** | 50,000 | Firebase Analytics / Mixpanel |
| **Total Loans Created** | 250,000 | Database aggregation |
| **On-Time Repayment Rate** | > 75% | `COUNT(paid loans where paid_date <= due_date) / COUNT(all paid loans)` |
| **Trust Score Distribution** | Median >= 500 | Statistical analysis of user scores |
| **Daily Reminder Completion Rate** | > 90% delivered | FCM + Twilio delivery receipts |
| **App Crash-Free Rate** | > 99.5% | Firebase Crashlytics |
| **Average Session Duration** | > 3 minutes | Firebase Analytics |
| **7-Day Retention** | > 40% | Cohort analysis |
| **30-Day Retention** | > 25% | Cohort analysis |
| **Loan Gifting Rate** | > 2% of active loans forgiven | Database query |
| **Average Streak Length** | > 15 days | Statistical mean of all user streaks |
| **IOU Generation Rate** | > 10% of active loans have IOU | Database query |
| **NPS (Net Promoter Score)** | > 40 | In-app survey (quarterly) |
| **API p95 Latency** | < 200ms (read) / < 500ms (write) | Fly.io monitoring / Datadog |
| **Time-to-First-Loan** | < 60 seconds from account creation | Funnel analysis |

---

## 9. Data Model Overview

The LoanTrack data model centers around the **User** and **Loan** entities, with satellite models for payments, reminders, trust scoring, relationships, IOUs, streaks, and gifting.

### Core Entities

```
User ──┬── Loan (as lender) ──┬── Payment
       │                      ├── ReminderLog
       │                      ├── DigitalIOU
       │                      └── Gift
       │
       ├── Loan (as borrower)
       │
       ├── TrustScore ── TrustScoreEvent
       ├── RelationshipEdge (to another User)
       ├── LoanFreeStreak ── StreakMilestone
       ├── DeviceToken
       └── NotificationLog
```

### Key Relationships

- **User : Loan** — One user can be the lender of many loans; another user can be the borrower of many loans. Loan has `lenderId` and `borrowerId` foreign keys.
- **Loan : Payment** — One-to-many. Each payment belongs to exactly one loan.
- **Loan : ReminderLog** — One-to-many. Each reminder log entry records a reminder sent for a loan at a specific escalation stage.
- **User : TrustScore** — One-to-one. Each user has exactly one TrustScore record (recalculated on events).
- **TrustScore : TrustScoreEvent** — One-to-many. Immutable log of all score changes.
- **User : RelationshipEdge** — Many-to-many (via edges). Each edge connects two users with aggregate lending data.
- **User : LoanFreeStreak** — One-to-one. Each user has exactly one streak record.
- **LoanFreeStreak : StreakMilestone** — One-to-many. Tracks which milestones the user has achieved.
- **Loan : DigitalIOU** — One-to-one (optional). Each loan can have at most one IOU.
- **DigitalIOU : IOUParty** — One-to-many (two parties: lender role + borrower role).
- **Loan : Gift** — One-to-one (optional). A loan may be forgiven as a gift.
- **User : DeviceToken** — One-to-many. Multiple device tokens per user for multi-device push.
- **User : NotificationLog** — One-to-many. Audit log of all notifications delivered.

### State Machine

```
                    ┌──────────────┐
                    │   ACTIVE     │
                    └──┬───┬───┬──┘
           full payment │   │   │ past due date
                        │   │   │
              ┌─────────┘   │   └──────────┐
              ▼             │              ▼
        ┌──────────┐       │       ┌──────────┐
        │   PAID   │       │       │ OVERDUE  │───full payment──▶ PAID
        └──────────┘       │       └──────────┘
                           │
                    forgive│ (gift)
                           ▼
                    ┌──────────┐
                    │ FORGIVEN │
                    └──────────┘
```

---

## 10. Regulatory & Legal Notes

### Data Protection (GDPR / CCPA / DPDP)

- **Right to Access:** Users can request all their data via Settings → Export Data. Delivered as JSON within 30 days.
- **Right to Erasure:** Users can delete their account. All PII (phone, name, avatar) is permanently deleted. Anonymized loan records (for counterparty integrity) are retained with `deleted_user_XXXX` placeholder.
- **Data Portability:** Export includes all loans, payments, trust score history, streak data, and relationships in machine-readable JSON.
- **Consent:** Phone number collection for auth is explicitly consented. Marketing/promotional notifications are opt-in only.
- **Data Minimization:** Only phone number is required for sign-up. Display name and avatar are optional.
- **Data Processing Agreement:** Available upon request for GDPR compliance. Processing limited to auth, notifications, and app functionality.
- **Subprocessors:** Supabase (database, auth, storage), Twilio (SMS), Firebase (push notifications), Upstash (Redis), Fly.io (hosting).

### PII Handling

- Phone numbers used as identifiers are hashed (SHA-256 + pepper) for contact lookup.
- Full phone numbers stored encrypted with AES-256-GCM.
- IP addresses logged for IOU signatures are stored encrypted and deleted after 90 days.
- Biometric data (FaceID/TouchID) is processed entirely on-device. LoanTrack never receives biometric data.

### Legal Disclaimer (In-App)

> **Disclaimer:** LoanTrack is a personal loan tracking and reminder tool. It is NOT a financial institution, legal service, or credit reporting agency. LoanTrack is not a party to any loan agreement and does not guarantee repayment. The Trust Score is a gamification feature for personal use only and does not constitute a credit score. Digital IOUs are for record-keeping purposes and may not be legally binding in all jurisdictions. Consult a legal professional for formal loan agreements. By using LoanTrack, you agree that LoanTrack is not liable for any disputes, defaults, or financial losses arising from loans tracked on this platform.

---

*End of PRD — Document maintained in `_bmad/planning-artifacts/prd.md`*
