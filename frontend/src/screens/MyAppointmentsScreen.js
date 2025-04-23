// src/screen/MyAppointmentsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, Alert, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function MyAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      console.warn('No authenticated user');
      return;
    }

    const q = query(collection(db, 'appointments'), where('user_id', '==', user.uid));
    const snapshot = await getDocs(q);

    const enriched = await Promise.all(
      snapshot.docs.map(async docSnap => {
        const data = docSnap.data();

        const slotRef = doc(db, 'businesses', data.business_id, 'slots', data.slot_id);
        const slotSnap = await getDoc(slotRef);
        const slotName = slotSnap.exists() ? slotSnap.data().name : 'Unknown Slot';

        const bizRef = doc(db, 'businesses', data.business_id);
        const bizSnap = await getDoc(bizRef);
        const businessData = bizSnap.exists() ? bizSnap.data() : null;
        const businessName = businessData ? businessData.name : 'Unknown Business';
        const businessOwnerId = businessData?.user_id;

        const userRef = doc(db, 'users', data.user_id);
        const userSnap = await getDoc(userRef);
        const customerName = userSnap.exists() ? userSnap.data().name : 'Unknown Customer';

        const servicerRef = businessOwnerId ? doc(db, 'users', businessOwnerId) : null;
        const servicerSnap = servicerRef ? await getDoc(servicerRef) : null;
        const servicerName = servicerSnap?.exists() ? servicerSnap.data().name : 'Unknown Servicer';

        return {
          id: docSnap.id,
          ...data,
          businessName,
          slotName,
          customerName,
          servicerName
        };
      })
    );

    setAppointments(enriched);
    setLoading(false);
  };

  const handleDelete = async (appointment) => {
    const { id, start_time, status } = appointment;
    const startTimeDate = new Date(start_time.seconds * 1000);
    const now = new Date();
    const diffHours = (startTimeDate - now) / (1000 * 60 * 60);

    if (status === 'confirmed' && diffHours < 24) {
      Alert.alert('Cannot Cancel', 'You can only cancel confirmed appointments more than 24 hours in advance.');
      return;
    }

    Alert.alert('Delete Appointment', 'Are you sure you want to delete this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'appointments', id));
            fetchAppointments();
            Alert.alert('Appointment deleted.');
          } catch (err) {
            console.error('Failed to delete appointment:', err);
            Alert.alert('Error deleting appointment');
          }
        }
      }
    ]);
  };

  const renderCountdown = (startTime) => {
    const now = new Date();
    const appointmentDate = new Date(startTime.seconds * 1000);
    const diffMs = appointmentDate - now;

    if (diffMs <= 0) return null;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return <Text style={{ color: 'green' }}>Starts in {hours}h {minutes}m</Text>;
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Appointments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CalendarView')}>
          <Ionicons name="calendar" size={28} color="#333" style={styles.icon} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.business}>{item.businessName}</Text>
            <Text>Customer: {item.customerName}</Text>
            <Text>Servicer: {item.servicerName}</Text>
            <Text>Slot: {item.slotName}</Text>
            <Text>Start: {new Date(item.start_time.seconds * 1000).toLocaleString()}</Text>
            <Text>Status: {item.status}</Text>
            {renderCountdown(item.start_time)}

            <View style={{ marginTop: 8 }}>
              {(item.status !== 'completed') && (
                <Button title="Delete" color="red" onPress={() => handleDelete(item)} />
              )}
              {item.status === 'completed' && (
                <Button title="Leave a Review" onPress={() => Alert.alert('Review', 'Leave a review feature coming soon!')} />
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>You don't have any appointments</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    padding: 4,
  },
  card: { backgroundColor: '#eee', padding: 12, marginBottom: 10, borderRadius: 6 },
  business: { fontWeight: 'bold', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: 'gray' }
});
