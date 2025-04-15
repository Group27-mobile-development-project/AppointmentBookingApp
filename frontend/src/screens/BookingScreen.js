//src/screens/BookingScreen.js
import { createGoogleCalendarEvent } from '../api/calendarApi';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BookingScreen({ route, navigation }) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const businessSnap = await getDoc(doc(db, 'businesses', businessId));
      if (businessSnap.exists()) {
        setBusiness(businessSnap.data());
      }

      const slotSnap = await getDocs(collection(db, 'businesses', businessId, 'slots'));
      const slotList = slotSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(slot => slot.is_active !== false);
      setSlots(slotList);
    };

    fetchData();
  }, [businessId]);

  const handleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Please sellect a slot before booking');
      return;
    }

    const user = getAuth().currentUser;
    if (!user) return;

    const googleSub = await AsyncStorage.getItem('google_sub');
    if (!googleSub) {
      console.warn('Google_sub not found');
      return;
    }

    const startTime = date;
    const endTime = new Date(startTime.getTime() + selectedSlot.duration_min * 60000);

    // Check conflict
    const q = query(
      collection(db, 'appointments'),
      where('slot_id', '==', selectedSlot.id),
      where('status', 'in', ['pending', 'confirmed'])
    );

    const snapshot = await getDocs(q);

    const conflict = snapshot.docs.some(docSnap => {
      const existing = docSnap.data();
      const existingStart = new Date(existing.start_time.seconds * 1000);
      const existingEnd = existing.end_time
        ? new Date(existing.end_time.seconds * 1000)
        : new Date(existingStart.getTime() + selectedSlot.duration_min * 60000);
      return startTime < existingEnd && existingStart < endTime;
    });

    console.log('Booking from:', startTime.toLocaleString(), 'to', endTime.toLocaleString());
    console.log('Conflict found:', conflict);

    if (conflict) {
      Alert.alert('The slot is not available during this time. Please select another time');
      return;
    }

    // Add appointment
    await addDoc(collection(db, 'appointments'), {
      user_id: googleSub,
      business_id: businessId,
      slot_id: selectedSlot.id,
      start_time: startTime,
      end_time: endTime,
      saved_at: serverTimestamp(),
      status: 'pending',
      note: '',
      google_event_id: ''
    });

    // Get token using google_sub
    try {
      const googleSub = await AsyncStorage.getItem('google_sub');
      if (!googleSub) {
        console.warn('Could not find google id');
        return;
      }

      let accessToken;
      for (let i = 0; i < 3; i++) {
        const tokenSnap = await getDoc(doc(db, 'users', googleSub, 'google_tokens', 'latest'));
        console.log(`try time: ${i + 1} - tokenSnap.exists:`, tokenSnap.exists());

        if (tokenSnap.exists()) {
          accessToken = tokenSnap.data()?.access_token;
          break;
        } else {
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      if (accessToken) {
        await createGoogleCalendarEvent(accessToken, {
          summary: selectedSlot.name,
          description: selectedSlot.description || '',
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Europe/Helsinki'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Europe/Helsinki'
          }
        });
      } else {
        console.warn('Cannot find token for Google Calendar event');
      }
    } catch (err) {
      console.error('Error when creating Google Calendar event', err);
    }

    Alert.alert('Booking successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {business && (
        <>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text>{business.description}</Text>
        </>
      )}

      <Text style={styles.sectionTitle}>Select Slot</Text>
      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Button
            title={`Slot: ${item.name}`}
            onPress={() => setSelectedSlot(item)}
            color={selectedSlot?.id === item.id ? 'green' : undefined}
          />
        )}
      />

      <Text style={styles.sectionTitle}>Select starting time</Text>
      <Button title={date.toLocaleString()} onPress={() => setShowPicker(true)} />

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={(e, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Button
        title="Book"
        onPress={handleBooking}
        disabled={!selectedSlot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  businessName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  sectionTitle: { marginTop: 16, fontWeight: 'bold' }
});
