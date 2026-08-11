// Currency constants
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'XOF', 'XAF', 'CDF', 'KES', 'NGN', 'ZAR'
] as const;

export type Currency = typeof CURRENCIES[number];

// Loan status constants
export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  PAID = 'PAID',
  FORGIVEN = 'FORGIVEN',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

// Payment method constants
export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  VENMO = 'VENMO',
  PAYPAL = 'PAYPAL',
  CASHAPP = 'CASHAPP',
  CRYPTO = 'CRYPTO',
  OTHER = 'OTHER'
}

// Reminder tone constants
export enum ReminderTone {
  FRIENDLY = 'FRIENDLY',
  POLITE = 'POLITE',
  FIRM = 'FIRM',
  SERIOUS = 'SERIOUS'
}

// Reminder channel constants
export enum ReminderChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  BOTH = 'BOTH'
}

// Trust score tier constants
export enum TrustScoreTier {
  UNTRUSTED = 'UNTRUSTED',
  BUILDING = 'BUILDING',
  RELIABLE = 'RELIABLE',
  TRUSTED = 'TRUSTED',
  EXEMPLARY = 'EXEMPLARY'
}

// Trust score event type constants
export enum TrustScoreEventType {
  ON_TIME_REPAYMENT = 'ON_TIME_REPAYMENT',
  LATE_REPAYMENT = 'LATE_REPAYMENT',
  DEFAULT_UNRESOLVED = 'DEFAULT_UNRESOLVED',
  DISPUTE_RESOLVED_POSITIVE = 'DISPUTE_RESOLVED_POSITIVE',
  DISPUTE_RESOLVED_NEGATIVE = 'DISPUTE_RESOLVED_NEGATIVE',
  LOAN_FORGIVEN = 'LOAN_FORGIVEN',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  TIER_UPGRADE = 'TIER_UPGRADE',
  TIER_DOWNGRADE = 'TIER_DOWNGRADE',
  GENEROSITY_BONUS = 'GENEROSITY_BONUS',
  PENALTY_APPLIED = 'PENALTY_APPLIED'
}

// IOU status constants
export enum IOUStatus {
  DRAFT = 'DRAFT',
  PENDING_LENDER = 'PENDING_LENDER',
  PENDING_BORROWER = 'PENDING_BORROWER',
  SIGNED = 'SIGNED',
  REVOKED = 'REVOKED'
}

// IOU signature method constants
export enum IOUSignatureMethod {
  DRAW = 'DRAW',
  TYPE = 'TYPE'
}

// Gift occasion constants
export enum GiftOccasion {
  BIRTHDAY = 'BIRTHDAY',
  HOLIDAY = 'HOLIDAY',
  ANNIVERSARY = 'ANNIVERSARY',
  GRADUATION = 'GRADUATION',
  JUST_BECAUSE = 'JUST_BECAUSE',
  CUSTOM = 'CUSTOM'
}

// Streak milestone badge constants
export enum StreakMilestoneBadge {
  WEEK_OF_FREEDOM = 'WEEK_OF_FREEDOM',
  MONTHLY_MASTERY = 'MONTHLY_MASTERY',
  QUARTERLY_CHAMPION = 'QUARTERLY_CHAMPION',
  HALF_YEAR_HERO = 'HALF_YEAR_HERO',
  DEBT_FREE_LEGEND = 'DEBT_FREE_LEGEND'
}

// Streak reset reason constants
export enum StreakResetReason {
  NEW_LOAN_CREATED = 'NEW_LOAN_CREATED',
  ADMIN_RESET = 'ADMIN_RESET'
}

// Notification type constants
export enum NotificationType {
  LOAN_CREATED = 'LOAN_CREATED',
  LOAN_ACCEPTED = 'LOAN_ACCEPTED',
  LOAN_OVERDUE = 'LOAN_OVERDUE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  REMINDER_SENT = 'REMINDER_SENT',
  LOAN_GIFTED = 'LOAN_GIFTED',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  TRUST_TIER_CHANGE = 'TRUST_TIER_CHANGE',
  IOU_SIGNED = 'IOU_SIGNED',
  LOAN_DISPUTED = 'LOAN_DISPUTED'
}

// Notification channel type constants
export enum NotificationChannelType {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP'
}

// Escalation ladder defaults
export const DEFAULT_ESCALATION_LADDER: ReminderStage[] = [
  {
    level: 1,
    delayDays: -1, // 1 day before due
    tone: ReminderTone.FRIENDLY,
    template: "Hey {borrower_name}! Just a heads-up about {amount} for {purpose}. No rush!",
    channel: ReminderChannel.PUSH,
    includeMeme: false
  },
  {
    level: 2,
    delayDays: 0, // Due date
    tone: ReminderTone.POLITE,
    template: "Hi {borrower_name}, just a reminder that {amount} is due today for {purpose}. Thanks!",
    channel: ReminderChannel.PUSH,
    includeMeme: false
  },
  {
    level: 3,
    delayDays: 7, // 7 days overdue
    tone: ReminderTone.FIRM,
    template: "Hi {borrower_name}, {amount} is now {days_overdue} days overdue. This may affect your Trust Score.",
    channel: ReminderChannel.BOTH,
    includeMeme: false
  },
  {
    level: 4,
    delayDays: 14, // 14 days overdue
    tone: ReminderTone.SERIOUS,
    template: "This is a final reminder about {amount} from {days_overdue} days ago.",
    channel: ReminderChannel.BOTH,
    includeMeme: true
  }
];