import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import useGoogleLogin from '../auth/GoogleLogin';

export default function LoginScreen({ onLogin }) {
  const { promptAsync, request } = useGoogleLogin(() => {
    onLogin(); // update login state
  });

  return (
    <View style={styles.container}>
      <Button
        title="Sign in with Google"
        onPress={() => promptAsync()}
        disabled={!request}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
