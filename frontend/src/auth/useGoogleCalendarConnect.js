// src/auth/useGoogleCalendarConnect.js
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { GOOGLE_CLIENT_ID } from '@env';

export default function useGoogleCalendarConnect(onConnected) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/calendar'],
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { accessToken, expiresIn } = response.authentication;
      const user = getAuth().currentUser;

      if (user && accessToken) {
        const tokenRef = doc(db, 'users', user.uid, 'google_tokens', 'calendar');
        setDoc(tokenRef, {
          access_token: accessToken,
          token_expiry: new Date(Date.now() + expiresIn * 1000),
          scope: 'calendar',
          saved_at: serverTimestamp()
        });
        console.log('[Calendar] Access Token saved for user:', user.uid);
        if (onConnected) onConnected(accessToken);
      }
    }
  }, [response]);

  return { promptAsync, request };
}
