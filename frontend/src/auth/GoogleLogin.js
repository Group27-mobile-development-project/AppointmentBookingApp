//src/auth/GoogleLogin.js
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANDROID_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleLogin(onLoginSuccess) {
  const redirectUri = AuthSession.makeRedirectUri({
    native: 'booking27://redirect',
    useProxy: false
  });
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: ANDROID_CLIENT_ID,
    redirectUri,
    useProxy: false,
    scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { accessToken, expiresIn, scope } = response.authentication;

      if (!accessToken) {
        console.error('Missing access token!');
        return;
      }

      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(res => res.json())
        .then(async (userInfo) => {
          console.log('Google userInfo:', userInfo);

          const userId = userInfo.sub;

          await AsyncStorage.setItem('google_sub', userId);

          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, {
            sub: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone_number || '',
            saved_at: serverTimestamp()
          }, { merge: true });

          const tokenRef = doc(db, 'users', userId, 'google_tokens', 'latest');
          await setDoc(tokenRef, {
            access_token: accessToken,
            refresh_token: null,
            token_expiry: new Date(Date.now() + expiresIn * 1000),
            scope,
            saved_at: serverTimestamp()
          });

          console.log('AccessToken saved to Firestore:', accessToken);
          if (onLoginSuccess) {
            onLoginSuccess(accessToken);
          }
        })
        .catch((err) => console.error('Fetch Google userinfo error:', err));
    }

    if (response?.type === 'error') {
      console.error('Google login error:', response);
    }
  }, [response]);

  return { promptAsync, request };
}