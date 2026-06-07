/**
 * Supabase Configuration
 * Initializes the Supabase client with project URL and anonymous key.
 */

// Supabase Project URL
const SUPABASE_URL = 'https://stjxenrwjidgesvytggl.supabase.co';

// Supabase Anon/Public Key (safe to expose in client-side code)
const SUPABASE_ANON_KEY = 'sb_publishable__yZuA6ecv6WUbIPRbdBhTA_4bji5JSY';

// Initialize Supabase client using the CDN-exposed createClient function
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verify client is working
console.log('Supabase client initialized:', !!supabase);
console.log('Supabase URL:', SUPABASE_URL);