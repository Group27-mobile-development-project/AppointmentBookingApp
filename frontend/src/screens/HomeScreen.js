// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchUserAppointments } from '../services/appointments';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [nextAppointment, setNextAppointment] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointments = await fetchUserAppointments();
        if (appointments.length > 0) {
          const sorted = appointments.sort(
            (a, b) => a.start_time.seconds - b.start_time.seconds
          );
          setNextAppointment(sorted[0]);
        }
      } catch (err) {
        console.error('Fail to fetch appointment', err);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      {/* Appointment Reminder Card with embedded banner */}
      <View style={styles.card}>
        <View style={styles.reminderBanner}>
          <Text style={styles.reminderText}>Appointments Reminder</Text>
        </View>

        <View style={styles.cardContent}>
          {nextAppointment ? (
            <>
              <Text style={styles.businessName}>
                Upcoming: {nextAppointment.businessName}
              </Text>
              <Text style={styles.dateText}>
                {new Date(
                  nextAppointment.start_time.seconds * 1000
                ).toLocaleString()}
              </Text>
            </>
          ) : (
            <Text style={styles.dateText}>
              You have no upcoming appointments.
            </Text>
          )}
        </View>
      </View>

      {/* Navigate to MyAppointments Button */}
      <TouchableOpacity
        style={styles.manageBtn}
        onPress={() => navigation.navigate('MyAppointments')}
      >
        <Text style={styles.manageBtnText}>Manage Appointment</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
    fontWeight: 'bold',
  },
  reminderBanner: {
    backgroundColor: '#343a40',
    paddingVertical: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  reminderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    overflow: 'hidden', // ensures rounded corners apply to inner content too
    marginBottom: 20,
  },
  cardContent: {
    padding: 12,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  manageBtn: {
    marginTop: 20,
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  manageBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
