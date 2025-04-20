// src/screens/BusinessAppointmentsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function BusinessAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const user = getAuth().currentUser;
      if (!user) {
        Alert.alert('You must be logged in to view your business appointments.');
        return;
      }

      const businessQuery = query(collection(db, 'businesses'), where('user_id', '==', user.uid));
      const businessSnapshot = await getDocs(businessQuery);
      if (businessSnapshot.empty) {
        Alert.alert('You do not have any business.');
        setLoading(false);
        return;
      }

      const businessIds = businessSnapshot.docs.map(doc => doc.id);

      const appointmentQuery = query(
        collection(db, 'appointments'),
        where('business_id', 'in', businessIds)
      );

      const appointmentSnapshot = await getDocs(appointmentQuery);
      const enriched = await Promise.all(appointmentSnapshot.docs.map(async docSnap => {
        const data = docSnap.data();

        // Get slot info
        const slotRef = doc(db, 'businesses', data.business_id, 'slots', data.slot_id);
        const slotSnap = await getDoc(slotRef);
        const slotName = slotSnap.exists() ? slotSnap.data().name : 'Unknown Slot';

        // Get business info
        const bizRef = doc(db, 'businesses', data.business_id);
        const bizSnap = await getDoc(bizRef);
        const businessData = bizSnap.exists() ? bizSnap.data() : null;
        const businessOwnerId = businessData?.user_id;

        // Get customer info
        const userRef = doc(db, 'users', data.user_id);
        const userSnap = await getDoc(userRef);
        const customerName = userSnap.exists() ? userSnap.data().name : 'Unknown Customer';

        // Get servicer info
        const servicerRef = businessOwnerId ? doc(db, 'users', businessOwnerId) : null;
        const servicerSnap = servicerRef ? await getDoc(servicerRef) : null;
        const servicerName = servicerSnap?.exists() ? servicerSnap.data().name : 'Unknown Servicer';

        return {
          id: docSnap.id,
          ...data,
          slotName,
          customerName,
          servicerName
        };
      }));

      setAppointments(enriched);
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, 'appointments', id), { status: newStatus });
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Appointments for Your Business</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.slot}>{item.slotName}</Text>
            <Text>Customer: {item.customerName}</Text>
            <Text>Servicer: {item.servicerName}</Text>
            <Text>Start: {new Date(item.start_time.seconds * 1000).toLocaleString()}</Text>
            <Text>Status: {item.status}</Text>

            {item.status === 'pending' && (
              <>
                <Button
                  title="Confirm"
                  onPress={() => updateStatus(item.id, 'confirmed')}
                />
                <View style={{ height: 8 }} />
                <Button
                  title="Cancel"
                  onPress={() => updateStatus(item.id, 'cancelled')}
                  color="red"
                />
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No appointments</Text>}
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
  slot: {
    fontWeight: 'bold',
    fontSize: 16
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: 'gray'
  }
});
