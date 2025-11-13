/**
 * Supabase Client Configuration
 * Replaces Firebase for authentication and database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log Supabase config (remove after fixing)
console.log('🔧 Supabase Config Check:', {
  urlExists: !!supabaseUrl,
  keyExists: !!supabaseAnonKey,
  urlPrefix: supabaseUrl?.substring(0, 30),
});

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your-supabase-url' && 
  supabaseAnonKey !== 'your-supabase-anon-key';

let supabase: ReturnType<typeof createClient> | undefined;

if (isConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  console.log('✅ Supabase initialized successfully');
} else {
  console.warn('⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export { supabase };
export default supabase;
