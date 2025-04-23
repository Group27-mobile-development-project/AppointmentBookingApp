// src/screens/BookingScreen.js
import React, { useEffect, useState } from 'react';
import { FlatList, Button } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { DateTime } from 'luxon';
import { getAuth } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const businessSnap = await getDoc(doc(db, 'businesses', businessId));
      if (businessSnap.exists()) setBusiness(businessSnap.data());

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
    if (!user) {
      Alert.alert("You must be logged in to book.");
      return;
    }

    const startTime = DateTime.fromJSDate(date).setZone('Europe/Helsinki').toJSDate();
    const endTime = DateTime.fromJSDate(startTime)
      .plus({ minutes: selectedSlot.duration_min })
      .toJSDate();

    await addDoc(collection(db, 'appointments'), {
      user_id: user.uid,
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

  const handleConfirm = (selectedDate) => {
    const picked = DateTime.fromJSDate(selectedDate).setZone('Europe/Helsinki');
    const now = DateTime.now().setZone('Europe/Helsinki');
    if (picked >= now) {
      setDate(roundToNextQuarterHour(selectedDate));
    } else {
      Alert.alert("You cannot select a past time.");
    }
    setPickerVisible(false);
  };

  return (
    <View style={styles.container}>
      {business && (
        <>
          <View style={styles.businessBanner}>
            <Text style={styles.businessName}>{business.name}</Text>
            <Text style={styles.businessDescription}>{business.description}</Text>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Select starting time</Text>

      <View style={styles.datePickerButtonContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.datePickerButtonText}>
            {date.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setPickerVisible(false)}
        is24Hour={true}
        minimumDate={new Date()}
      />

      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isAvailable = slotAvailability[item.id];
          const nextAvailable = new Date(date.getTime() + item.duration_min * 60000);
          return (
            <TouchableOpacity
              style={[
                styles.slotButton,
                !isAvailable && styles.slotButtonUnavailable,
                selectedSlot?.id === item.id && styles.slotButtonSelected
              ]}
              onPress={() => isAvailable && setSelectedSlot(item)}
              disabled={!isAvailable}
            >
              <Text style={styles.slotText}>
                {isAvailable
                  ? `${item.name} (${nextAvailable.toLocaleTimeString()})`
                  : `${item.name} (Unavailable)` }
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <Button
        title="Book"
        onPress={handleBooking}
        disabled={!selectedSlot}
        color="#000" // Black color for the "Book" button
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  businessBanner: {
    backgroundColor: '#343a40', // Black background for the business section
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 10,
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  businessDescription: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: { marginTop: 16, fontWeight: 'bold', color: '#000' },
  datePickerButtonContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  datePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff', // White background for the button
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerButtonText: {
    color: '#000', // Black color for the text inside the button
    fontSize: 16,
    fontWeight: 'bold',
  },
  slotButton: {
    backgroundColor: '#000', // Black background for slot buttons
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: '#4CAF50', // Green when selected
  },
  slotButtonUnavailable: {
    backgroundColor: '#D3D3D3', // Gray when unavailable
    opacity: 0.6, // Add blur effect
  },
  slotText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});