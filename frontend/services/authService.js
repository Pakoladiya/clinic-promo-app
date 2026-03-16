// frontend/services/authService.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Login function
export const login = async (email, password) => {
    const { user, session, error } = await supabase.auth.signIn({
        email,
        password,
    });
    if (error) throw error;
    return { user, session };
};

// Logout function
export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Function to get current session
export const getSession = () => {
    return supabase.auth.session();
};

// Function to check if user is logged in
export const isLoggedIn = () => {
    return !!getSession();
};

// Function to handle session management (optional)
export const manageSession = () => {
    const session = getSession();
    // Implement your session handling logic here if needed
};
