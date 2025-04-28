import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView,
  Keyboard, Platform
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { DateTime } from 'luxon';
import { getAuth } from 'firebase/auth';
import {
  doc, getDoc, collection, getDocs, addDoc,
  serverTimestamp, query, where
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
  const [slotNextAvailableTime, setSlotNextAvailableTime] = useState({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteFocused, setNoteFocused] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const businessSnap = await getDoc(doc(db, 'businesses', businessId));
        if (businessSnap.exists()) setBusiness(businessSnap.data());

        const slotSnap = await getDocs(collection(db, 'businesses', businessId, 'slots'));
        const slotList = slotSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(slot => slot.is_active !== false);
        setSlots(slotList);
        await checkSlotConflicts(slotList, date);
      } catch (error) {
        console.error('Error fetching booking data:', error);
        Alert.alert('Error', 'Failed to load booking information.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [businessId]);

  useEffect(() => {
    if (slots.length > 0) {
      checkSlotConflicts(slots, date);
    }
  }, [date]);

  const checkSlotConflicts = async (slotList, selectedDate) => {
    const availability = {};
    const nextTimes = {};

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

      if (isConflicting) {
        const nextAvailable = await findNextAvailableTime(slot, slot.duration_min);
        nextTimes[slot.id] = nextAvailable;
      }
    }

    setSlotAvailability(availability);
    setSlotNextAvailableTime(nextTimes);
  };

  const findNextAvailableTime = async (slot, durationMin) => {
    const now = DateTime.now().setZone('Europe/Helsinki');
    for (let i = 1; i <= 96; i++) {
      const raw = now.plus({ minutes: i * 15 }).toJSDate();
      const start = roundToNextQuarterHour(raw);
      const end = new Date(start.getTime() + durationMin * 60000);

      const q = query(
        collection(db, 'appointments'),
        where('slot_id', '==', slot.id),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const snapshot = await getDocs(q);

      const isConflicting = snapshot.docs.some(docSnap => {
        const existing = docSnap.data();
        const existingStart = new Date(existing.start_time.seconds * 1000);
        const existingEnd = existing.end_time
          ? new Date(existing.end_time.seconds * 1000)
          : new Date(existingStart.getTime() + durationMin * 60000);
        return start < existingEnd && existingStart < end;
      });

      if (!isConflicting) return start;
    }
    return null;
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
      note: note,
      google_event_id: ''
    });

    Alert.alert('Booking successful!');
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        data={noteFocused ? [] : slots}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {business && (
              <View style={styles.businessBanner}>
                <Text style={styles.businessName}>{business.name}</Text>
                <Text style={styles.businessDescription}>{business.description}</Text>
              </View>
            )}

            {!noteFocused && (
              <>
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
              </>
            )}
          </>
        }
        renderItem={({ item }) => {
          const isAvailable = slotAvailability[item.id];
          const displayTime = isAvailable
            ? date.toLocaleTimeString()
            : slotNextAvailableTime[item.id]?.toLocaleTimeString?.() || 'N/A';

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
                {`${item.name} (${displayTime})`}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>Leave a note (Optional)</Text>

            <View style={styles.noteInputContainer}>
              <TextInput
                style={[
                  styles.noteInput,
                  noteFocused && { height: 150, fontSize: 16 }
                ]}
                placeholder="Please leave a note here."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                placeholderTextColor={"#888"}
                onFocus={() => setNoteFocused(true)}
                onBlur={() => setNoteFocused(false)}
              />
            </View>

            {!noteFocused && (
              <TouchableOpacity
                style={[styles.bookButton, !selectedSlot && { backgroundColor: '#A5D6A7' }]}
                onPress={handleBooking}
                disabled={!selectedSlot}
              >
                <Text style={styles.bookButtonText}>Book</Text>
              </TouchableOpacity>
            )}
          </>
        }
        contentContainerStyle={[styles.container, noteFocused && { justifyContent: 'center' }]}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  businessBanner: {
    backgroundColor: '#343a40',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  slotButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  slotButtonUnavailable: {
    backgroundColor: '#D3D3D3',
    opacity: 0.6,
  },
  slotText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteInputContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  noteInput: {
    padding: 12,
    fontSize: 14,
    color: '#000',
    textAlignVertical: 'top',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
