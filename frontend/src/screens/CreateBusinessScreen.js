// src/screens/CreateBusinessScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateBusinessScreen({ navigation }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Business name must not be empty');
      return;
    }

    const user = getAuth().currentUser;
    if (!user) return;

    const googleSub = await AsyncStorage.getItem('google_sub');
    if (!googleSub) {
      Alert.alert('Unable to identify Google user. Please re-login.');
      return;
    }

    const businessId = uuid.v4();
    const businessRef = doc(db, 'businesses', businessId);
    await setDoc(businessRef, {
      user_id: googleSub,
      category_ids: [],
      name,
      description: desc,
      location: '',
      contact_email: user.email,
      contact_phone: user.phoneNumber || '',
      google_calendar_id: '',
      saved_at: serverTimestamp()
    });

    Alert.alert('Your business is created successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Business Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        style={styles.input}
      />
      <Button title="Create Business" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 4
  }
});
