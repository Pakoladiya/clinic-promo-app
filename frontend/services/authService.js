import supabase from './supabaseClient';

export const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
};

export const isLoggedIn = async () => {
    const session = await getSession();
    return !!session;
};
