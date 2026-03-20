import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../App';

export function useAdmin() {
  const { user }    = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    getDoc(doc(db, 'admin', user.uid))
      .then(snap => setIsAdmin(snap.exists()));
  }, [user]);

  return isAdmin;
}
