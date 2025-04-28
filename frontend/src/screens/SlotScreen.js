// src/screens/SlotScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';

export default function SlotScreen({ route, navigation }) {
  const { businessId, slotId } = route.params;
  const [slot, setSlot] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMin, setDurationMin] = useState('');

  useEffect(() => {
    fetchSlotData();
  }, []);

  const fetchSlotData = async () => {
    const currentUser = getAuth().currentUser;
    if (!businessId || !slotId || !currentUser) return;

    try {
      const slotRef = doc(db, 'businesses', businessId, 'slots', slotId);
      const slotSnap = await getDoc(slotRef);

      if (slotSnap.exists()) {
        const slotData = slotSnap.data();
        setSlot(slotData);

        const businessRef = doc(db, 'businesses', businessId);
        const businessSnap = await getDoc(businessRef);
        if (businessSnap.exists()) {
          const businessData = businessSnap.data();
          setIsOwner(currentUser.uid === businessData.user_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch slot or business:', error);
      Alert.alert('Error', 'Failed to fetch slot or business.');
    }
  };

  const toggleActiveStatus = async () => {
    try {
      const slotRef = doc(db, 'businesses', businessId, 'slots', slotId);
      await updateDoc(slotRef, { is_active: !slot.is_active });
      setSlot(prev => ({ ...prev, is_active: !prev.is_active }));
    } catch (err) {
      Alert.alert('Error', 'Failed to update active status.');
    }
  };

  const startEditing = () => {
    setName(slot.name || '');
    setDescription(slot.description || '');
    setDurationMin(String(slot.duration_min || ''));
    setEditing(true);
  };

  const handleUpdateSlot = async () => {
    if (!name || !durationMin) {
      Alert.alert('Validation Error', 'Name and Duration are required.');
      return;
    }

    try {
      const slotRef = doc(db, 'businesses', businessId, 'slots', slotId);
      await updateDoc(slotRef, {
        name,
        description,
        duration_min: parseInt(durationMin),
      });
      setSlot(prev => ({
        ...prev,
        name,
        description,
        duration_min: parseInt(durationMin)
      }));
      setEditing(false);
      Alert.alert('Success', 'Slot updated.');
    } catch (err) {
      Alert.alert('Error', 'Failed to update slot.');
    }
  };

  if (!slot) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Nút Quay về BusinessScreen */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Business', { businessId })}
        >
          <Text style={styles.backButtonText}>← Back to Business</Text>
        </TouchableOpacity>

        {editing ? (
          <>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Service Name"
            />
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
            />
            <TextInput
              style={styles.input}
              value={durationMin}
              onChangeText={setDurationMin}
              placeholder="Duration (min)"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleUpdateSlot}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{slot.name}</Text>
            <Text>Description: {slot.description || 'No description'}</Text>
            <Text>Duration: {slot.duration_min} min</Text>
            <Text>Status: {slot.is_active ? 'Active' : 'Inactive'}</Text>

            {isOwner ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { backgroundColor: slot.is_active ? '#4caf50' : '#f44336' }
                  ]}
                  onPress={toggleActiveStatus}
                >
                  <Text style={styles.buttonText}>
                    {slot.is_active ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={startEditing}
                >
                  <Text style={styles.buttonText}>Edit Info</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Nếu là user, có nút Book Now */}
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => navigation.navigate('Booking', { businessId })}
                >
                  <Text style={styles.buttonText}>Book Now</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#eaeaea',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  toggleButton: {
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196f3',
  },
});
