// src/screens/ui/LoginScreen.js
import React from 'react';
import { Button } from 'react-native';
import useGoogleLogin from '../auth/GoogleLogin.js';

export default function LoginScreen() {
  const { promptAsync, request } = useGoogleLogin();

  return (
    <Button
      title="Sign in with Google"
      onPress={() => promptAsync()}
      disabled={!request}
    />
  );
}
