import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import uuid from 'react-native-uuid';
import { Picker } from '@react-native-picker/picker';

export default function CreateSlotScreen({ route, navigation }) {
  const { businessId } = route.params;
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
      if (list.length > 0) setSelectedCategory(list[0].id);
    };
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !duration || !selectedCategory) {
      Alert.alert('Please fill in all fields!');
      return;
    }

    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('User not authenticated');
      return;
    }

    const slotId = uuid.v4();
    const slotRef = doc(db, 'businesses', businessId, 'slots', slotId);

    await setDoc(slotRef, {
      name,
      description: desc,
      duration_min: Number(duration),
      saved_at: serverTimestamp(),
      is_active: true,
      category_id: selectedCategory
    });

    Alert.alert('Slot created successfully');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
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

      <Text style={styles.label}>Select Category</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.input}
      >
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

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
    marginBottom: 4,
    marginTop: 12
  }
});
