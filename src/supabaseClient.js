import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Verify if environment variables are set and not default placeholders
export const hasSupabaseConfig = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.startsWith('https://');

export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initialize admin client with service role key for administrative operations
export const supabaseAdmin = hasSupabaseConfig && !!supabaseServiceKey && supabaseServiceKey !== 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (!hasSupabaseConfig) {
  console.warn(
    'Supabase configuration not detected or incomplete. Foundaxia Academy is running in Mock Mode (using localStorage persistence).'
  );
}
