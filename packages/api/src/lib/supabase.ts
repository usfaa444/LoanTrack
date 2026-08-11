import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Create a single supabase admin client instance
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Send OTP to a phone number via Supabase Auth
 * @param phone Phone number in E.164 format
 * @returns Promise resolving to success boolean
 */
export async function sendOtp(phone: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithOtp({
    phone
  });

  if (error) {
    console.error('Supabase OTP send error:', error);
    return false;
  }

  return true;
}

/**
 * Verify OTP code for a phone number
 * @param phone Phone number in E.164 format
 * @param code OTP code received by user
 * @returns Promise resolving to user object or null
 */
export async function verifyOtp(phone: string, code: string): Promise<any | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: 'sms'
  });

  if (error) {
    console.error('Supabase OTP verify error:', error);
    return null;
  }

  return data.user;
}