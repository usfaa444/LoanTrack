# LoanTrack — Complete API Reference

> Auto-generated from route source files — updated August 20, 2026  
> Base URL: `http://YOUR_VPS_IP:3001` or `http://localhost:3001`  
> All `/v1*` endpoints return JSON. Auth uses `Bearer <token>` header.

---

## 🔑 Auth

### POST `/v1/auth/email/register`
- **Auth:** None
- **Body (JSON):**
  - `email` (string, required) — valid email address
  - `password` (string, required) — min 6 characters
  - `displayName` (string, required) — min 1 character
- **Response 201:** `{ success, token, user: { id, email, displayName } }`
- **Response 400:** `{ error: "Registration failed" }`

### POST `/v1/auth/email/login`
- **Auth:** None
- **Body (JSON):**
  - `email` (string, required) — valid email
  - `password` (string, required) — min 6 characters
- **Response 200:** `{ success, token, user: { id, email } }`
- **Response 401:** `{ error: "Invalid credentials" }`

### POST `/v1/auth/firebase/token`
- **Auth:** None
- **Body (JSON):**
  - `idToken` (string, required) — Firebase ID token from client SDK
- **Response 200:** `{ success, token, user: { id, phone, hasPinSet } }`
- **Response 400:** `{ error: "idToken required" }` or `{ error: "No phone in token" }`

### POST `/v1/auth/phone/send`
- **Auth:** None
- **Body (JSON):**
  - `phone` (string, required) — phone number with country code, e.g. "+22670000000"
- **Response 200:** `{ success: true }` (placeholder — returns success immediately)
- **Note:** This is a placeholder. Real SMS integration (Twilio/Africa's Talking) needed.

### POST `/v1/auth/phone/verify`
- **Auth:** None
- **Body (JSON):**
  - `phone` (string, required) — phone number
  - `code` (string, required) — 6-digit OTP code
- **Response 501:** `{ error: "Not implemented yet" }` (placeholder)

### POST `/v1/auth/pin/setup`
- **Auth:** `Bearer <token>`
- **Body (JSON):**
  - `pin` (string, required) — 4 to 6 digits
- **Response 200:** `{ success }`
- **Response 401:** `{ error: "Unauthorized" }`

### POST `/v1/auth/pin/verify`
- **Auth:** `Bearer <token>`
- **Body (JSON):**
  - `pin` (string, required) — 4 to 6 digits
- **Response 200:** `{ success }`
- **Response 401:** `{ error: "Invalid PIN" }`

---

## 💰 Loans

### POST `/v1/loans`
- **Auth:** `Bearer <token>`
- **Body (JSON):**
  - `lenderId` (string, required, UUID) — ID of the lender
  - `borrowerId` (string, required, UUID) — ID of the borrower (user creating must be lender or borrower)
  - `amount` (number, required) — loan amount
  - `purpose` (string, optional) — free-text loan purpose
  - `purposeCode` (string, optional) — structured purpose tag (e.g. "school_fees", "medical")
  - `interestRate` (number, optional, default 0) — interest rate percentage
  - `dueDate` (string, optional, ISO date) — repayment deadline
  - `currency` (string, optional, default "USD") — 3-letter currency code
  - `collateralDescription` (string, optional)
- **Response 201:** Created loan object

### GET `/v1/loans`
- **Auth:** `Bearer <token>`
- **Query params:**
  - `status` (string, optional) — filter by status: ACTIVE, OVERDUE, PAID, FORGIVEN, DISPUTED, CANCELLED
  - `asLender` (boolean, optional, default true) — include loans where user is lender
  - `asBorrower` (boolean, optional, default true) — include loans where user is borrower
- **Response 200:** Array of loan objects

### GET `/v1/loans/:id`
- **Auth:** `Bearer <token>`
- **Params:** `id` — loan UUID
- **Response 200:** Loan object with full relations
- **Response 404:** `{ error: "Loan not found" }`

### PATCH `/v1/loans/:id`
- **Auth:** `Bearer <token>`
- **Params:** `id` — loan UUID
- **Body (JSON):** Partial loan fields to update (amount, purpose, dueDate, status, etc.)
- **Response 200:** Updated loan object

### DELETE `/v1/loans/:id`
- **Auth:** `Bearer <token>`
- **Params:** `id` — loan UUID
- **Response 200:** `{ success: true }`

### POST `/v1/loans/:id/payments`
- **Auth:** `Bearer <token>`
- **Params:** `id` — loan UUID
- **Body (JSON):**
  - `amount` (number, required) — payment amount
  - `method` (string, optional) — payment method: CASH, BANK_TRANSFER, MOBILE_MONEY, OTHER
  - `note` (string, optional) — payment note
  - `paidAt` (string, optional, ISO date) — when payment was made (default: now)
  - `autoBalance` (boolean, optional) — auto-adjust to prevent overpayment
- **Response 201:** Created payment object

### GET `/v1/loans/:id/payments`
- **Auth:** `Bearer <token>`
- **Params:** `id` — loan UUID
- **Response 200:** Array of payment objects for the loan

### POST `/v1/loans/:id/memos`
- **Auth:** `Bearer <token>`
- **Params:** `id` — loan UUID
- **Body (JSON):**
  - `url` (string, required) — Firebase Storage URL of the voice memo file
  - `durationSecs` (number, optional, default 0) — duration in seconds
- **Response 201:** Created VoiceMemo object
- **Response 403:** User must be lender or borrower

### GET `/v1/loans/:id/memos`
- **Auth:** `Bearer <token>`
- **Params:** `id` — loan UUID
- **Response 200:** Array of VoiceMemo objects for loan

### GET `/v1/loans/:id/receipt`
- **Auth:** `Bearer <token>`
- **Params:** `id` — loan UUID
- **Response 200:** `{ payloadHash, signature, prevHash, payload }` — cryptographically signed loan receipt (SHA-256 + HMAC-SHA256)
- **Response 404:** Loan not found

### GET `/v1/loans/:id/verify`
- **Auth:** None (public verification)
- **Params:** `id` — loan UUID
- **Response 200:** `{ valid: boolean, payloadHash, computedHash, signedAt }`
- **Response 404:** `{ error: "No signed record found" }`

---

## 💳 Payments

### PATCH `/v1/payments/:id`
- **Auth:** `Bearer <token>`
- **Params:** `id` — payment UUID
- **Body (JSON):**
  - `newAmount` (number, required) — corrected payment amount
  - `reason` (string, required) — correction reason
- **Response 200:** `{ success, remainingBalance }` — creates PaymentCorrection audit trail and recomputes loan balance

### GET `/v1/payments/pending`
- **Auth:** `Bearer <token>`
- **Response 200:** Array of pending PaymentConfirmations (where the counterparty needs to confirm)

### POST `/v1/payments/:id/confirm`
- **Auth:** `Bearer <token>`
- **Params:** `id` — paymentConfirmation UUID
- **Response 200:** `{ success }` — marks confirmation as CONFIRMED
- **Response 403:** User is not the assigned confirmer

---

## 📊 Dashboard

### GET `/v1/dashboard`
- **Auth:** `Bearer <token>`
- **Response 200:**
  ```json
  {
    "activeLoans": number,
    "paidLoans": number,
    "overdueLoans": number,
    "totalLent": number,       // sum of remainingBalance on lent ACTIVE/OVERDUE
    "totalBorrowed": number,   // sum of remainingBalance on borrowed ACTIVE/OVERDUE
    "recentLoans": Loan[]      // last 5 loans
  }
  ```

---

## 📈 Analytics

### GET `/v1/analytics/purposes`
- **Auth:** None
- **Query params:**
  - `from` (string, optional, ISO date) — start date filter
  - `to` (string, optional, ISO date) — end date filter
- **Response 200:** `[{ purposeCode, count, totalAmount }]`

### GET `/v1/analytics/regions`
- **Auth:** None
- **Response 200:** `[{ region: "Ouagadougou / Centre", count, totalAmount }]`

### GET `/v1/analytics/wallets`
- **Auth:** None
- **Response 200:** `[{ wallet: "orange_money", count }]`

### GET `/v1/analytics/seasonal`
- **Auth:** None
- **Response 200:** `[{ month: "2026-08", count, totalAmount }]` — sorted chronologically

---

## ⭐ Trust Score

### GET `/v1/score/me`
- **Auth:** `Bearer <token>`
- **Response 200:**
  ```json
  {
    "score": 650,
    "breakdown": {
      "onTimeRate": 85,         // percentage
      "totalLoans": 12,
      "defaultedCount": 1,
      "avgLoanAmount": 25000,
      "streakDays": 30
    }
  }
  ```
- **Algorithm:** base 500 + (onTimeRate×3) + min(loanCount×5, 100) − (defaultRate×200) + min(avgAmount/1000, 50) + min(streakDays×2, 50). Clamped 0–1000.

---

## 🏆 Badges

### GET `/v1/badges`
- **Auth:** None
- **Response 200:** Array of all badge definitions `[{ id, code, labelFr, icon, tier }]`

### GET `/v1/badges/me`
- **Auth:** `Bearer <token>`
- **Response 200:** Array of badges earned by the current user

---

## 🔥 Streaks

### GET `/v1/streaks/me`
- **Auth:** `Bearer <token>`
- **Response 200:** `{ currentStreak: number, longestStreak: number }` — loan-free days

---

## 👤 Users

### GET `/v1/users/me`
- **Auth:** `Bearer <token>`
- **Response 200:** `{ id, phone, email, displayName, region, city, preferredWallet, defaultCurrency, isTrustScorePublic, hasPinSet, createdAt }`

### PATCH `/v1/users/me`
- **Auth:** `Bearer <token>`
- **Body (JSON):** At least one of:
  - `region` (string, optional) — region name, max 100 chars
  - `city` (string, optional) — city name, max 100 chars
  - `preferredWallet` (string, optional) — orange_money, moov, wave, cash, bank
  - `displayName` (string, optional) — user display name
- **Response 200:** Updated user profile

---

## 🕌 Tontines

Tontines support both registered and unregistered members. The `rotationOrder` accepts phone numbers (e.g. `"+22670000000"`) or objects `{phone, displayName}`. Unregistered users are tracked by phone number only; when they later create an account, their `userId` is automatically linked via `POST /v1/tontines/:id/link`.

### POST `/v1/tontines`
- **Auth:** `Bearer <token>`
- **Body (JSON):**
  - `name` (string, required) — tontine name
  - `contributionAmount` (number, required) — amount per member per cycle
  - `rotationOrder` (array, required) — ordered array of `"+226XXXXXXXX"` strings OR `{phone: "+226XXXXXXXX", displayName: "Awa"}` objects. Phone numbers are the canonical identifier.
  - `currency` (string, optional, default "XOF") — 3-letter code
  - `frequency` (string, optional, default "monthly") — weekly, biweekly, monthly
- **Response 201:** Created Tontine with members. Members with phone numbers matching existing users are auto-linked (`userId` populated).
- **Response 400:** Missing required fields

### GET `/v1/tontines`
- **Auth:** `Bearer <token>`
- **Response 200:** Array of tontines where user is: creator, linked member (by userId), OR member by phone number match

### GET `/v1/tontines/:id`
- **Auth:** `Bearer <token>`
- **Params:** `id` — tontine UUID
- **Response 200:** Single tontine with members (sorted by order). Member fields: `id, phone, displayName, userId, registered, hasPaid, order`

### POST `/v1/tontines/:id/rotate`
- **Auth:** `Bearer <token>` — creator only
- **Params:** `id` — tontine UUID
- **Response 200:** `{ currentIdx, nextHolder: { phone, displayName, userId } }` — marks current member paid, advances rotation

### POST `/v1/tontines/:id/link`
- **Auth:** `Bearer <token>`
- **Params:** `id` — tontine UUID
- **Description:** Links the authenticated user's account to their tontine membership (by matching their `phone` to a membership record). Use this when an unregistered member creates an account.
- **Response 200:** `{ success, linked: true }` or `{ success, alreadyLinked: true }`
- **Response 404:** No membership found for this user's phone in this tontine

### GET `/v1/tontines/:id/status`
- **Auth:** `Bearer <token>`
- **Params:** `id` — tontine UUID
- **Response 200:** `{ currentHolder: {phone, displayName, userId, registered}, nextHolder, members: [{phone, displayName, userId, registered, hasPaid, order}], cycleComplete }`

---

## ⚠️ Disputes

### POST `/v1/disputes`
- **Auth:** `Bearer <token>`
- **Body (JSON):**
  - `loanId` (string, required, UUID) — the disputed loan
  - `reason` (string, required) — dispute reason, max 500 chars
- **Response 201:** Created Dispute object
- **Response 403:** User must be lender or borrower of the loan

### GET `/v1/disputes`
- **Auth:** `Bearer <token>`
- **Response 200:** Array of disputes raised by user, with loan summary fields

### PATCH `/v1/disputes/:id`
- **Auth:** `Bearer <token>`
- **Params:** `id` — dispute UUID
- **Body (JSON):**
  - `status` (string, optional) — open, mediated, resolved, rejected
  - `resolution` (string, optional) — resolution text
- **Response 200:** Updated dispute (resolvedAt auto-set when status is "resolved" or "rejected")

---

## 🔔 Reminders

### GET `/v1/reminders/queue`
- **Auth:** `Bearer <token>`
- **Response 200:** `[{ id, amount, remainingBalance, borrower, dueDate, daysOverdue, escalationStage, lastReminderAt }]`

### POST `/v1/reminders/process`
- **Auth:** `x-cron-secret` header (dev default: `dev-cron-secret`)
- **Response 200:** `{ processed: total, sent: count, skipped: count }`
- **Stages:** Friendly → Firm → Meme → Mediator (every 3 days overdue, stages 1–4)

---

## 📱 Notifications

### GET `/v1/notifications`
- **Auth:** `Bearer <token>`
- **Query params:**
  - `limit` (number, optional, default 50)
  - `offset` (number, optional, default 0)
- **Response 200:** Array of NotificationLog objects (newest first)

### PATCH `/v1/notifications/:id/read`
- **Auth:** `Bearer <token>`
- **Params:** `id` — notification UUID
- **Response 200:** `{ success }`

### PATCH `/v1/notifications/read-all`
- **Auth:** `Bearer <token>`
- **Response 200:** `{ success }` — marks all unread notifications as read

---

## 📲 Devices

### POST `/v1/devices`
- **Auth:** `Bearer <token>`
- **Body (JSON):**
  - `token` (string, required) — FCM push notification token
  - `platform` (string, required) — ios or android
  - `deviceName` (string, optional)
- **Response 201:** `{ success }`

### DELETE `/v1/devices/:token`
- **Auth:** `Bearer <token>`
- **Params:** `token` — FCM token string to remove
- **Response 200:** `{ success }`

---

## 💬 WhatsApp Webhook

### GET `/v1/whatsapp/webhook`
- **Auth:** `hub.verify_token` query param (dev: `dev-wa-token`, configurable via `WHATSAPP_VERIFY_TOKEN` env)
- **Query params:**
  - `hub.mode` (string) — must be "subscribe"
  - `hub.verify_token` (string) — token match
  - `hub.challenge` (string) — WhatsApp challenge string to echo back
- **Response 200:** `text/plain` — returns `hub.challenge` if verified
- **Response 403:** Token mismatch

### POST `/v1/whatsapp/webhook`
- **Auth:** None (WhatsApp posts here)
- **Body:** WhatsApp webhook payload (`entry[0].changes[0].value.messages[0]`)
- **Commands parsed from message text:**
  - `Credit <amount>` — recorded as loan creation intent
  - `Paid <amount>` — recorded as payment intent
  - `Balance` / `Solde` — returns outstanding balance sum
  - `Help` / `Aide` — returns command list
- **Response 200:** `{ status: "ok", reply: "..." }`

---

## 🏥 Health

### GET `/health`
- **Auth:** None
- **Response 200:** `{ status: "ok", db: "connected" }`

---

## 📊 Quick Reference

| Category | Count | Prefix | Auth required |
|----------|-------|--------|---------------|
| Auth | 7 | `/v1/auth` | 2 require, 5 public |
| Loans (CRUD) | 5 | `/v1/loans` | All require |
| Payments (on loans) | 2 | `/v1/loans` | All require |
| Voice Memos | 2 | `/v1/loans` | All require |
| Signed Records | 2 | `/v1/loans` | 1 require, 1 public |
| Payment Corrections | 3 | `/v1/payments` | All require |
| Dashboard | 1 | `/v1/dashboard` | Requires |
| Analytics | 4 | `/v1/analytics` | All public |
| Trust Score | 1 | `/v1/score` | Requires |
| Badges | 2 | `/v1/badges` | 1 public |
| Streaks | 1 | `/v1/streaks` | Requires |
| Users (profile) | 2 | `/v1/users` | All require |
| Tontines | 5 | `/v1/tontines` | All require |
| Disputes | 3 | `/v1/disputes` | All require |
| Reminders | 2 | `/v1/reminders` | 1 auth + 1 cron-secret |
| Notifications | 3 | `/v1/notifications` | All require |
| Devices | 2 | `/v1/devices` | All require |
| WhatsApp | 2 | `/v1/whatsapp/webhook` | Public |
| Health | 1 | `/health` | Public |
| **TOTAL** | **49** | | **38 auth-gated** |