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

export default function MyAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const user = getAuth().currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'appointments'),
      where('user_id', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    const enriched = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
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

    setAppointments(enriched);
    setLoading(false);
  };

  const handleDelete = async (appointmentId) => {
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
              setAppointments((prev) => prev.filter((item) => item.id !== appointmentId));
              Alert.alert('Appointment deleted.');
            } catch (err) {
              console.error('Failed to delete appointment:', err);
              Alert.alert('Error deleting appointment');
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>You don't have any appointments.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#666',
    fontSize: 13,
  },
  cardDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: 'gray',
  },
});
