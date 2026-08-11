import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured — set SUPABASE_URL and SUPABASE_ANON_KEY');
    }
    _supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabase;
}

export async function sendOtp(phone: string): Promise<boolean> {
  try {
    const { error } = await getSupabase().auth.signInWithOtp({ phone });
    return !error;
  } catch {
    return false;
  }
}

export async function verifyOtp(phone: string, code: string): Promise<any | null> {
  try {
    const { data, error } = await getSupabase().auth.verifyOtp({
      phone, token: code, type: 'sms',
    });
    return error ? null : data.user;
  } catch {
    return null;
  }
}