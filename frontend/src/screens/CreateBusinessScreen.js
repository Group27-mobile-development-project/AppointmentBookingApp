// src/screens/CreateBusinessScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import uuid from 'react-native-uuid';

export default function CreateBusinessScreen({ navigation }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async () => {
    const user = getAuth().currentUser;
    if (!user) return; 

    const businessId = uuid.v4();
    const businessRef = doc(db, 'businesses', businessId);
    await setDoc(businessRef, {
      user_id: user.uid,
      category_ids: [],
      name,
      description: desc,
      location: '',
      contact_email: user.email,
      contact_phone: user.phoneNumber || '',
      google_calendar_id: '',
      saved_at: serverTimestamp()
    });

    if (!name.trim()) {
        alert('Business name must not be empty');
        return;
      }

    alert('Your business is created successfully!');
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
