import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { useAuth } from '../App';

export function useAdmin() {
  const { user }    = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase
      .from('admin')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  return isAdmin;
}
