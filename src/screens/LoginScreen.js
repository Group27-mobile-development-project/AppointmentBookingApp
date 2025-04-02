import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signInWithGoogle } from '../services/GoogleAuth';

const LoginScreen = ({ navigation }) => {
  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      navigation.replace('Home', { user });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Booking</Text>
      <Button title="Sign in with Google" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default LoginScreen;
