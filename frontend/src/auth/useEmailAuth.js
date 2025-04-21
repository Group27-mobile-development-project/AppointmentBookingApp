// src/auth/useEmailAuth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function useEmailAuth(onLoginSuccess) {
  const auth = getAuth();

  const signUp = async (email, password, name = '') => {
    console.log('[SIGNUP] email:', email, '| password:', password, '| name:', name);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('[SIGNUP SUCCESS] user.uid:', user.uid);

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email: user.email,
        phone: '',
        saved_at: serverTimestamp()
      }, { merge: true });

      onLoginSuccess(user.uid);
    } catch (error) {
      console.error('[SIGNUP ERROR]', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    console.log('[LOGIN] email:', email, '| password:', password);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('[LOGIN SUCCESS] user.uid:', user.uid);

      onLoginSuccess(user.uid);
    } catch (error) {
      console.error('[LOGIN ERROR]', error);
      throw error;
    }
  };

  return { signUp, signIn };
}
