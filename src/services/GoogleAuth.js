import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
});

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const user = await auth().signInWithCredential(googleCredential);
    return user;
  } catch (error) {
    console.error(error);
  }
};

export const signOut = async () => {
  await GoogleSignin.signOut();
  await auth().signOut();
};
