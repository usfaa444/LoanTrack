// Loan types
export interface Loan {
  id: string;
  lenderId: string;
  borrowerId: string;
  amount: number;
  remainingBalance: number;
  currency: Currency;
  purpose: string;
  interestRate: number;
  collateralDescription?: string;
  status: LoanStatus;
  escalationStage: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  borrowerAcceptedAt?: Date;
  paidAt?: Date;
  forgivenAt?: Date;
  disputedAt?: Date;
  disputedBy?: string;
  cancelledAt?: Date;
  deletedAt?: Date;
}

// Payment types
export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  purposeTag?: string;
  paidAt: Date;
  recordedById: string;
  createdAt: Date;
}

// User types
export interface User {
  id: string;
  phone: string;
  phoneHash: string;
  displayName?: string;
  avatarUrl?: string;
  defaultCurrency: Currency;
  isTrustScorePublic: boolean;
  hasPinSet: boolean;
  pinHash?: string;
  pinAttempts: number;
  pinLockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Trust types
export interface TrustScore {
  userId: string;
  score: number;
  tier: TrustScoreTier;
  baseScore: number;
  repaymentBonus: number;
  defaultPenalty: number;
  tenureBonus: number;
  volumeBonus: number;
  badgeBonus: number;
  updatedAt: Date;
}

export interface TrustScoreEvent {
  id: string;
  userId: string;
  type: TrustScoreEventType;
  delta: number;
  newScore: number;
  associatedLoanId?: string;
  createdAt: Date;
}

// Reminder types
export interface ReminderTemplate {
  id: string;
  loanId: string;
  isActive: boolean;
  stages: ReminderStage[];
}

export interface ReminderStage {
  level: number;
  delayDays: number;
  tone: ReminderTone;
  template: string;
  channel: ReminderChannel;
  includeMeme: boolean;
}

export interface ReminderLog {
  id: string;
  loanId: string;
  stage: number;
  channel: ReminderChannel;
  sentAt: Date;
  deliveredAt?: Date;
  failureReason?: string;
}

// IOU types
export interface DigitalIOU {
  id: string;
  loanId: string;
  iouId: string;
  status: IOUStatus;
  pdfUrl?: string;
  verificationUrl: string;
  qrCodeUrl?: string;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOUParty {
  id: string;
  iouId: string;
  userId?: string;
  legalName: string;
  phone: string;
  signatureUrl?: string;
  signatureMethod?: IOUSignatureMethod;
  signedAt?: Date;
  ipAddress?: string;
  deviceInfo?: string;
}

// Streak types
export interface LoanFreeStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastResetAt?: Date;
  lastResetReason?: StreakResetReason;
  updatedAt: Date;
  createdAt: Date;
}

export interface StreakMilestone {
  id: string;
  userId: string;
  days: number;
  badge: StreakMilestoneBadge;
  achievedAt?: Date;
}

// Gift types
export interface Gift {
  id: string;
  loanId: string;
  lenderId: string;
  borrowerId: string;
  amount: number;
  currency: Currency;
  occasion: GiftOccasion;
  message?: string;
  forgivenAt: Date;
  createdAt: Date;
}

// Notification types
export interface NotificationLog {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
  channel: NotificationChannelType;
  externalId?: string;
}

// Device types
export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  deviceName?: string;
  createdAt: Date;
  lastSeenAt: Date;
}