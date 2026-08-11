import { sendSmsAfricaTalking } from './africastalking';
import { sendSmsTwilio } from './twilio';

// Provider registry
const providers = {
  'africastalking': sendSmsAfricaTalking,
  'twilio': sendSmsTwilio
};

// Country to provider mapping (simplified)
const countryProviders: Record<string, string> = {
  'KE': 'africastalking',
  'NG': 'africastalking',
  'GH': 'africastalking',
  'US': 'twilio',
  'CA': 'twilio',
  'GB': 'twilio'
};

/**
 * Get appropriate SMS provider for a phone number
 * @param phoneNumber Phone number in E.164 format
 * @returns Provider function or null
 */
export function getProviderForPhoneNumber(phoneNumber: string): ((to: string, message: string) => Promise<boolean>) | null {
  // Extract country code (assumes E.164 format)
  const countryCode = phoneNumber.substring(1, 3);
  
  // Map common country codes to countries
  const countryMap: Record<string, string> = {
    '254': 'KE',
    '234': 'NG',
    '233': 'GH',
    '1': 'US',
    '44': 'GB'
  };
  
  const country = countryMap[countryCode] || 'US'; // Default to US/Twilio
  const providerName = countryProviders[country] || 'twilio'; // Default to Twilio
  
  return providers[providerName] || null;
}

/**
 * Auto-select and send SMS via appropriate provider
 * @param to Recipient phone number
 * @param message SMS message
 * @returns Promise resolving to success boolean
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
  const provider = getProviderForPhoneNumber(to);
  
  if (!provider) {
    console.error('No SMS provider found for phone number:', to);
    return false;
  }
  
  return await provider(to, message);
}