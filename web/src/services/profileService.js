import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export const getProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'profiles', uid));
  return snap.exists() ? snap.data() : null;
};

export const upsertProfile = (uid, fields) =>
  setDoc(doc(db, 'profiles', uid), { ...fields, updatedAt: new Date().toISOString() }, { merge: true });

export const uploadLogo = async (uid, file) => {
  const ext     = file.name.split('.').pop();
  const logoRef = ref(storage, `logos/${uid}.${ext}`);
  await uploadBytes(logoRef, file);
  return getDownloadURL(logoRef);
};
