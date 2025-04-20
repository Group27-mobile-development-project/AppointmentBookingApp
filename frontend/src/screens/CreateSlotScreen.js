// src/screens/CreateSlotScreen.js
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import uuid from 'react-native-uuid';
import { Picker } from '@react-native-picker/picker';

export default function CreateSlotScreen({ navigation }) {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const q = query(collection(db, 'businesses'), where('user_id', '==', user.uid));
      const snapshot = await getDocs(q);
      const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBusinesses(result);
      if (result.length === 1) setSelectedBusiness(result[0].id);
    };

    fetchBusinesses();
  }, []);

  const handleCreate = async () => {
    if (!selectedBusiness || !name.trim() || !duration) {
      Alert.alert('Please fill in all fields!');
      return;
    }

    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('User not authenticated');
      return;
    }

    const q = query(
      collection(db, 'businesses'),
      where('user_id', '==', user.uid),
      where('__name__', '==', selectedBusiness)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      Alert.alert('You do not have permission to create a slot for this business.');
      return;
    }

    const slotId = uuid.v4();
    const slotRef = doc(db, 'businesses', selectedBusiness, 'slots', slotId);
    await setDoc(slotRef, {
      name,
      description: desc,
      duration_min: Number(duration),
      saved_at: serverTimestamp(),
      is_active: true,
      category_id: ''
    });

    Alert.alert('Slot created successfully');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Business</Text>
      <Picker
        selectedValue={selectedBusiness}
        onValueChange={(itemValue) => setSelectedBusiness(itemValue)}>
        {businesses.map((biz) => (
          <Picker.Item key={biz.id} label={biz.name} value={biz.id} />
        ))}
      </Picker>

      <TextInput
        placeholder="Slot name"
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
      <TextInput
        placeholder="Duration (minutes)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Create" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 4
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4
  }
});
