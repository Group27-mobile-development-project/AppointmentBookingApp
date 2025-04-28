

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import uuid from 'react-native-uuid';
import { Picker } from '@react-native-picker/picker';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';

export default function CreateSlotScreen({ route, navigation }) {
  const { businessId } = route.params;
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(list);
        if (list.length > 0) setSelectedCategory(list[0].id);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories.');
      }
    };
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !duration || !selectedCategory) {
      Alert.alert('Validation Error', 'Please fill in all fields!');
      return;
    }

    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const slotId = uuid.v4();
    const slotRef = doc(db, 'businesses', businessId, 'slots', slotId);

    try {
      await setDoc(slotRef, {
        name,
        description: desc,
        duration_min: Number(duration),
        saved_at: serverTimestamp(),
        is_active: true,
        category_id: selectedCategory
      });

      Alert.alert('Success', 'Slot created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating slot:', error);
      Alert.alert('Error', 'Failed to create slot.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Slot Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Duration (minutes)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Select Category</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.input}
      >
        {categories.map((cat) => (
          <Picker.Item
            key={cat.id}
            label={cat.name}
            value={cat.id}
            color="#000" 
          />
        ))}
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    color: '#000',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
