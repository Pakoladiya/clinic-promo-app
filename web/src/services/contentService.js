import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export const fetchByDiscipline = async (discipline) => {
  try {
    const q    = query(
      collection(db, 'content'),
      where('discipline', '==', discipline),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

export const fetchAll = async () => {
  try {
    const snap = await getDocs(
      query(collection(db, 'content'), orderBy('discipline'), orderBy('createdAt', 'desc'))
    );
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

export const addContent = (fields) =>
  addDoc(collection(db, 'content'), { ...fields, createdAt: new Date().toISOString() });

export const updateContent = (id, fields) =>
  updateDoc(doc(db, 'content', id), fields);

export const deleteContent = (id) =>
  deleteDoc(doc(db, 'content', id));
