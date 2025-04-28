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
  const [ongoingAppointments, setOngoingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('You must be logged in to view your business appointments.');
      return;
    }

    try {
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
      const now = new Date();

      const enriched = await Promise.all(appointmentSnapshot.docs.map(async docSnap => {
        const data = docSnap.data();
        const slotRef = doc(db, 'businesses', data.business_id, 'slots', data.slot_id);
        const slotSnap = await getDoc(slotRef);
        const slotName = slotSnap.exists() ? slotSnap.data().name : 'Unknown Slot';

        const bizRef = doc(db, 'businesses', data.business_id);
        const bizSnap = await getDoc(bizRef);
        const businessData = bizSnap.exists() ? bizSnap.data() : null;
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
          slotName,
          customerName,
          servicerName
        };
      }));

      const ongoing = enriched
        .filter(item => new Date(item.start_time.seconds * 1000) >= now)
        .sort((a, b) => a.start_time.seconds - b.start_time.seconds);

      const past = enriched
        .filter(item => new Date(item.start_time.seconds * 1000) < now)
        .sort((a, b) => b.start_time.seconds - a.start_time.seconds);

      setOngoingAppointments(ongoing);
      setPastAppointments(past);
    } catch (error) {
      console.error('Error fetching business appointments:', error);
      Alert.alert('Error', 'Failed to load business appointments.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
      fetchAppointments();
      Alert.alert('Status updated.');
    } catch (err) {
      console.error('Failed to update status:', err);
      Alert.alert('Error updating status');
    }
  };

  const renderAppointmentCard = (item) => (
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
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#000" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Appointments for Your Business</Text>

      <FlatList
        data={ongoingAppointments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Ongoing / Upcoming Appointments</Text>}
        renderItem={({ item }) => renderAppointmentCard(item)}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming appointments</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <FlatList
        data={pastAppointments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Past Appointments</Text>}
        renderItem={({ item }) => renderAppointmentCard(item)}
        ListEmptyComponent={<Text style={styles.empty}>No past appointments</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 8, color: '#000' },
  card: {
    backgroundColor: '#eee',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  slot: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: 'gray',
  }
});
