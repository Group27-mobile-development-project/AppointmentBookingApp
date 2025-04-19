// src/screens/BookingScreen.js
import { createGoogleCalendarEvent } from '../api/calendarApi';
import { DateTime } from 'luxon';
import { Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Round up to next 15 min in Helsinki time
function roundToNextQuarterHour(date) {
  const dt = DateTime.fromJSDate(date).setZone('Europe/Helsinki');
  const minutes = dt.minute;
  const nextQuarter = Math.ceil(minutes / 15) * 15;
  return dt.set({ minute: nextQuarter, second: 0, millisecond: 0 }).toJSDate();
}

export default function BookingScreen({ route, navigation }) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState(roundToNextQuarterHour(new Date()));
  const [showPicker, setShowPicker] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState({});

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

      checkSlotConflicts(slotList, date);
    };

    fetchData();
  }, [businessId]);

  useEffect(() => {
    checkSlotConflicts(slots, date);
  }, [date]);

  const checkSlotConflicts = async (slotList, selectedDate) => {
    const availability = {};
    for (let slot of slotList) {
      const q = query(
        collection(db, 'appointments'),
        where('slot_id', '==', slot.id),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const snapshot = await getDocs(q);
      const startTime = selectedDate;
      const endTime = new Date(startTime.getTime() + slot.duration_min * 60000);
      const isConflicting = snapshot.docs.some(docSnap => {
        const existing = docSnap.data();
        const existingStart = new Date(existing.start_time.seconds * 1000);
        const existingEnd = existing.end_time
          ? new Date(existing.end_time.seconds * 1000)
          : new Date(existingStart.getTime() + slot.duration_min * 60000);
        return startTime < existingEnd && existingStart < endTime;
      });
      availability[slot.id] = !isConflicting;
    }
    setSlotAvailability(availability);
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Please select a slot before booking');
      return;
    }

    const user = getAuth().currentUser;
    if (!user) return;

    const googleSub = await AsyncStorage.getItem('google_sub');
    if (!googleSub) return;

    const startTime = DateTime.fromJSDate(date).setZone('Europe/Helsinki').toJSDate();
    const endTime = DateTime.fromJSDate(startTime).plus({ minutes: selectedSlot.duration_min }).toJSDate();

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

      <Text style={styles.sectionTitle}>Select starting time</Text>

      {Platform.OS === 'web' ? (
        <View style={styles.inputWrapper}>
          <Text>Pick a date and time:</Text>
          <input
            type="datetime-local"
            value={DateTime.fromJSDate(date).toISO({ suppressMilliseconds: true }).slice(0, 16)}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const now = DateTime.now().setZone('Europe/Helsinki');
              if (!isNaN(selectedDate) && DateTime.fromJSDate(selectedDate).setZone('Europe/Helsinki') >= now) {
                setDate(roundToNextQuarterHour(selectedDate));
              } else {
                alert("You cannot select a past time.");
              }
            }}
            min={DateTime.now().setZone('Europe/Helsinki').toISO({ suppressMilliseconds: true }).slice(0, 16)}
            style={{
              padding: 8,
              marginTop: 6,
              marginBottom: 12,
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
          />
        </View>
      ) : (
        <>
          <Button title={date.toLocaleString()} onPress={() => setShowPicker(true)} />
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              is24Hour={true}
              display="default"
              minimumDate={DateTime.now().setZone('Europe/Helsinki').toJSDate()}
              onChange={(e, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  const helsinkiNow = DateTime.now().setZone('Europe/Helsinki');
                  const picked = DateTime.fromJSDate(selectedDate).setZone('Europe/Helsinki');
                  if (picked >= helsinkiNow) {
                    setDate(roundToNextQuarterHour(selectedDate));
                  } else {
                    Alert.alert("You cannot select a past time.");
                  }
                }
              }}
            />
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>Available Slots</Text>
      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isAvailable = slotAvailability[item.id];
          const nextAvailable = new Date(date.getTime() + item.duration_min * 60000);
          return (
            <Button
              title={
                isAvailable
                  ? `Slot: ${item.name} (Available now)`
                  : `Slot: ${item.name} (Next: ${nextAvailable.toLocaleTimeString()})`
              }
              onPress={() => isAvailable && setSelectedSlot(item)}
              color={selectedSlot?.id === item.id ? 'green' : isAvailable ? undefined : 'gray'}
              disabled={!isAvailable}
            />
          );
        }}
      />

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
  sectionTitle: { marginTop: 16, fontWeight: 'bold' },
  inputWrapper: { marginBottom: 12 }
});
