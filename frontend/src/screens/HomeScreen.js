import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      <View style={styles.reminderBtn}>
        <Text style={styles.reminderText}>Reminder</Text>
      </View>

      <View style={styles.card}>
        <Image
          source={{ uri: 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.businessName}>Barbershop</Text>
          <Text style={styles.dateText}>15/04/2025 (4:30pm - 6:00pm)</Text>
        </View>
      </View>
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
  reminderBtn: {
    backgroundColor: 'black',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  reminderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    backgroundColor: '#ccc',
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    color: '#888',
    fontSize: 14,
  },
});
