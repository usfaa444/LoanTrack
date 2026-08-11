export interface SmsProvider {
  name: string;
  sendSms(phoneNumber: string, message: string): Promise<SmsResult>;
  validatePhoneNumber(phoneNumber: string): boolean;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  deliveryStatus: DeliveryStatus;
  error?: string;
  cost?: number;
  provider: string;
}

export enum DeliveryStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  UNDELIVERABLE = 'undeliverable'
}