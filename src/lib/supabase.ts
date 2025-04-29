
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log connection status - helpful for debugging
console.log('Supabase client initialized with URL:', 
  supabaseUrl === 'https://your-supabase-project.supabase.co' ? 
  'FALLBACK URL (not connected)' : 
  'Connected to Supabase');
