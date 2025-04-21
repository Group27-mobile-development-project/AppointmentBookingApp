import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

export default function MyAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      console.warn('No authenticated user');
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('user_id', '==', user.uid)
    );

    const snapshot = await getDocs(q);
    const enriched = await Promise.all(snapshot.docs.map(async docSnap => {
      const data = docSnap.data();

      // Get slot info
      const slotRef = doc(db, 'businesses', data.business_id, 'slots', data.slot_id);
      const slotSnap = await getDoc(slotRef);
      const slotName = slotSnap.exists() ? slotSnap.data().name : 'Unknown Slot';

      // Get business info
      const bizRef = doc(db, 'businesses', data.business_id);
      const bizSnap = await getDoc(bizRef);
      const businessData = bizSnap.exists() ? bizSnap.data() : null;
      const businessName = businessData ? businessData.name : 'Unknown Business';
      const businessOwnerId = businessData?.user_id;

      // Get customer name
      const userRef = doc(db, 'users', data.user_id);
      const userSnap = await getDoc(userRef);
      const customerName = userSnap.exists() ? userSnap.data().name : 'Unknown Customer';

      // Get business owner name
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
    }));

    setAppointments(enriched);
    setLoading(false);
  };

  const handleDelete = async (appointmentId) => {
    const isWeb = typeof window !== 'undefined';

    if (isWeb) {
      const confirmed = window.confirm('Are you sure you want to delete this appointment?');
      if (!confirmed) return;
      try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
        setAppointments(prev => prev.filter(item => item.id !== appointmentId));
        window.alert('Appointment deleted.');
      } catch (err) {
        console.error('Failed to delete appointment:', err);
        window.alert('Error deleting appointment');
      }
    } else {
      Alert.alert(
        'Delete Appointment',
        'Are you sure you want to delete this appointment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteDoc(doc(db, 'appointments', appointmentId));
                setAppointments(prev => prev.filter(item => item.id !== appointmentId));
                Alert.alert('Appointment deleted.');
              } catch (err) {
                console.error('Failed to delete appointment:', err);
                Alert.alert('Error deleting appointment');
              }
            }
          }
        ]
      );
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Appointments</Text>
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
            <View style={{ marginTop: 8 }}>
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDelete(item.id)}
              />
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
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  card: {
    backgroundColor: '#eee',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6
  },
  business: {
    fontWeight: 'bold',
    fontSize: 16
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: 'gray'
  }
});
