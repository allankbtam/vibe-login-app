/**
 * Supabase Configuration
 * Initializes the Supabase client with project URL and anonymous key.
 */

// Supabase Project URL
const SUPABASE_URL = 'https://stjxenrwjidgesvytggl.supabase.co';

// Supabase Anon/Public Key (safe to expose in client-side code)
const SUPABASE_ANON_KEY = 'sb_publishable__yZuA6ecv6WUbIPRbdBhTA_4bji5JSY';

// Check if Supabase library is loaded
if (typeof Supabase === 'undefined') {
    console.error('Supabase library is NOT loaded! Check the CDN script tag in index.html.');
} else {
    console.log('Supabase library loaded successfully.');
    console.log('Supabase.createClient available:', typeof Supabase.createClient === 'function');
}

// Initialize Supabase client using the CDN-exposed createClient function
let supabase;
try {
    supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully.');
    console.log('Supabase URL:', SUPABASE_URL);
} catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabase = null;
}
