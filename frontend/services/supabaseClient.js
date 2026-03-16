// supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and public API key
environment const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;