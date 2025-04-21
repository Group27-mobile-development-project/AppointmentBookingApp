
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import useEmailAuth from '../auth/useEmailAuth';

export default function LoginScreen({ navigation }) {
  const { signIn, signUp } = useEmailAuth((uid) => {
    if (uid) navigation.replace('Home', { userId: uid });
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');

  const handleAuth = async () => {
    console.log('[AUTH ACTION]', isSignup ? 'SIGNUP' : 'LOGIN');
    console.log('Email:', email);
    console.log('Password:', password);
    try {
      if (isSignup) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      Alert.alert('Authentication Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {isSignup && (
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title={isSignup ? "Sign Up" : "Login"} onPress={handleAuth} />
      <Text style={styles.switchText} onPress={() => setIsSignup(!isSignup)}>
        {isSignup ? "Already have an account? Login" : "No account? Sign up"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, justifyContent: 'center' },
  input: { borderWidth: 1, padding: 8, marginVertical: 6, borderRadius: 4 },
  switchText: { color: 'blue', marginTop: 12, textAlign: 'center' }
});

