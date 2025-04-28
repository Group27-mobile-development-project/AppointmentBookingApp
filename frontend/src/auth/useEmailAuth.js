
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function useEmailAuth(onLoginSuccess) {
  const auth = getAuth();

  const signUp = async (email, password, name = '') => {
    console.log('[SIGNUP] email:', email, '| password:', password, '| name:', name);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('[SIGNUP SUCCESS] user.uid:', user.uid);

      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email: user.email,
        phone: '',
        image_url: '',
        saved_at: serverTimestamp(),
        is_verified: false,
      }, { merge: true });

      alert('Verification email sent. Please check your inbox and verify your email before logging in.');

      await auth.signOut();
      
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

      if (!user.emailVerified) {
        await auth.signOut();
        throw new Error('Email not verified. Please verify your email first.');
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await auth.signOut();
        throw new Error('User data not found.');
      }

      const userData = userDoc.data();
      if (!userData.is_verified) {
        await setDoc(doc(db, 'users', user.uid), {
          is_verified: true
        }, { merge: true });
      }

      onLoginSuccess(user.uid);

    } catch (error) {
      console.error('[LOGIN ERROR]', error);
      throw error;
    }
  };

  return { signUp, signIn };
}
