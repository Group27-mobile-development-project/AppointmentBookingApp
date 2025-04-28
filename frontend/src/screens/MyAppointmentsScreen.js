// src/screens/MyAppointmentsScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function MyAppointmentsScreen() {
  const [ongoingAppointments, setOngoingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const user = getAuth().currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'appointments'),
        where('user_id', '==', user.uid)
      );
      const snapshot = await getDocs(q);

      const now = new Date();

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
            servicerName,
          };
        })
      );

      const ongoing = enriched
        .filter(item => new Date(item.start_time.seconds * 1000) >= now)
        .sort((a, b) => a.start_time.seconds - b.start_time.seconds);

      const past = enriched
        .filter(item => new Date(item.start_time.seconds * 1000) < now)
        .sort((a, b) => b.start_time.seconds - a.start_time.seconds);

      setOngoingAppointments(ongoing);
      setPastAppointments(past);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load your appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async appointment => {
    const { id, start_time, status } = appointment;
    const startTimeDate = new Date(start_time.seconds * 1000);
    const now = new Date();
    const diffHours = (startTimeDate - now) / (1000 * 60 * 60);

    if (status === 'confirmed' && diffHours < 24) {
      Alert.alert(
        'Cannot Cancel',
        'You can only cancel confirmed appointments more than 24 hours in advance.'
      );
      return;
    }

    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'appointments', id));
            fetchAppointments();
            Alert.alert('Appointment canceled.');
          } catch (err) {
            console.error('Failed to cancel appointment:', err);
            Alert.alert('Error canceling appointment');
          }
        },
      },
    ]);
  };

  const renderAppointmentCard = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.businessName}>{item.businessName}</Text>
          <Text style={styles.dateText}>
            {new Date(item.start_time.seconds * 1000).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>Customer: {item.customerName}</Text>
        <Text style={styles.detailText}>Servicer: {item.servicerName}</Text>
        <Text style={styles.detailText}>Slot: {item.slotName}</Text>
        <Text style={styles.detailText}>Status: {item.status}</Text>
      </View>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#000" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons
          name="calendar"
          size={25}
          color="#333"
          onPress={() => navigation.navigate('CalendarView')}
          style={styles.icon}
        />
        <Text style={styles.header}>My Appointments</Text>
      </View>

      <FlatList
        data={ongoingAppointments}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.reminderBanner}>
            <Text style={styles.reminderText}>Ongoing / Upcoming Appointments</Text>
          </View>
        }
        renderItem={({ item }) => renderAppointmentCard(item)}
        ListEmptyComponent={
          <Text style={styles.empty}>No upcoming appointments.</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <FlatList
        data={pastAppointments}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.reminderBanner}>
            <Text style={styles.reminderText}>Past Appointments</Text>
          </View>
        }
        renderItem={({ item }) => renderAppointmentCard(item)}
        ListEmptyComponent={
          <Text style={styles.empty}>No past appointments.</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 },
  icon: { marginRight: 8 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  reminderBanner: { backgroundColor: '#343a40', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  reminderText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#f2f2f2', borderRadius: 10, padding: 15, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  businessName: { fontSize: 16, fontWeight: 'bold' },
  dateText: { color: '#666', fontSize: 13 },
  cardDetails: { marginBottom: 10 },
  detailText: { fontSize: 14, color: '#555' },
  cancelBtn: { backgroundColor: '#dc3545', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-end' },
  cancelText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: 'gray' },
});
