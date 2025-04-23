import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function CalendarViewScreen() {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;

      const q = query(collection(db, 'appointments'), where('user_id', '==', user.uid));
      const snapshot = await getDocs(q);
      const dataMap = {};
      const marks = {};

      const today = new Date();
      const datesToPreload = {};
      for (let i = -30; i <= 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        datesToPreload[dateStr] = [];
      }

      await Promise.all(snapshot.docs.map(async docSnap => {
        const data = docSnap.data();
        const startDate = new Date(data.start_time.seconds * 1000);
        const dateStr = startDate.toISOString().split('T')[0];

        const [slotSnap, bizSnap] = await Promise.all([
          getDoc(doc(db, 'businesses', data.business_id, 'slots', data.slot_id)),
          getDoc(doc(db, 'businesses', data.business_id))
        ]);

        const slotName = slotSnap.exists() ? slotSnap.data().name : 'Unknown Slot';
        const businessName = bizSnap.exists() ? bizSnap.data().name : 'Unknown Business';

        if (!dataMap[dateStr]) dataMap[dateStr] = [];

        dataMap[dateStr].push({
          name: `${businessName} - ${slotName}`,
          status: data.status,
          time: startDate.toLocaleTimeString(),
          height: 80
        });

        marks[dateStr] = { marked: true };
      }));

      setItems({ ...datesToPreload, ...dataMap });
      setMarkedDates(marks);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load calendar.');
    } finally {
      setLoading(false);
    }
  }, []);

  const renderItem = (item) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Status: <Text style={styles.status}>{item.status}</Text></Text>
      <Text style={styles.time}>Time: {item.time}</Text>
    </View>
  );

  const renderEmptyDate = () => (
    <View style={styles.emptyDate}>
      <Text style={styles.emptyText}>No Appointments</Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#0000ff" />;

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        selected={new Date().toISOString().split('T')[0]}
        pastScrollRange={3}
        futureScrollRange={3}
        showClosingKnob={true}
        refreshing={loading}
        markedDates={markedDates}
        onRefresh={loadAppointments}
        loadItemsForMonth={() => {}}
        theme={{
          agendaDayTextColor: 'black',
          agendaDayNumColor: 'blue',
          agendaTodayColor: 'red',
          agendaKnobColor: 'gray'
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    marginRight: 10,
    marginTop: 17,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4
  },
  status: {
    textTransform: 'capitalize',
    color: '#555'
  },
  time: {
    color: '#666',
    marginTop: 2
  },
  emptyDate: {
    height: 50,
    flex: 1,
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic'
  }
});
