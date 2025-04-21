// src/screens/GoogleLogin.js
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleLogin() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '',
    useProxy: true,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { accessToken, expiresIn, scope } = response.authentication;

      if (!accessToken) {
        console.error(' Missing access token!');
        return;
      }

      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(res => res.json())
        .then(async (userInfo) => {
          console.log('Google userInfo:', userInfo);

          const userId = userInfo.sub;

          // users/{userId}
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, {
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone_number || '',
            saved_at: serverTimestamp()
          }, { merge: true });

          // tokenId
          const tokenRef = doc(db, 'users', userId, 'google_tokens', 'latest');
          await setDoc(tokenRef, {
            access_token: accessToken,
            refresh_token: null,
            token_expiry: new Date(Date.now() + expiresIn * 1000),
            scope,
            saved_at: serverTimestamp()
          });

          console.log(' Google login & Firestore saved successfully!');
        })
        .catch((err) => console.error('Fetch Google userinfo error:', err));
    }
  }, [response]);

  return { promptAsync, request };
}
