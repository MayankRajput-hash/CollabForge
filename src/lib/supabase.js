import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
console.log("VITE_SUPABASE_URL =", supabaseUrl);
console.log("VITE_SUPABASE_ANON_KEY exists =", !!supabaseAnonKey);
console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);
const isPlaceholderValue = value =>
  /^(?:\*+|your[-_ ]|placeholder|replace[-_ ]?me)|\.{3}/i.test(value.trim());
const isValidSupabaseUrl = (() => {
  try {
    const url = new URL(supabaseUrl);
    return url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch {
    return false;
  }
})();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  isValidSupabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' && 
  !supabaseUrl.toLowerCase().includes('placeholder') &&
  !isPlaceholderValue(supabaseUrl) &&
  !isPlaceholderValue(supabaseAnonKey)
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
