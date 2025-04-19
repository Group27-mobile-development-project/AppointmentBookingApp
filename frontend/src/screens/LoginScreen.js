// src/screens/Login.js
import React from 'react';
import { Button } from 'react-native';
import useGoogleLogin from '../auth/GoogleLogin';

export default function LoginScreen({ navigation }) {
  const { promptAsync, request } = useGoogleLogin((accessToken) => {
    if (accessToken) {
      navigation.replace('Home', {accessToken});
    }
  });
  return (
    <Button
      title="Sign in with Google"
      onPress={() => promptAsync()}
      disabled={!request}
    />
  );
}
