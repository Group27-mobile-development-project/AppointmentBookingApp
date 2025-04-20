import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, signOut } from 'firebase/auth';

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const sub = await AsyncStorage.getItem('google_sub') || await AsyncStorage.getItem('userId');
        if (!sub) return;

        const userDoc = await getDoc(doc(db, 'users', sub));
        if (userDoc.exists()) {
          setUsername(userDoc.data().name || '');
        }
      } catch (err) {
        console.error('Fail to get username', err);
      }
    };

    fetchUsername();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      await AsyncStorage.clear(); // Xoá tất cả dữ liệu local
      navigation.replace('Login'); // Quay về Login
    } catch (err) {
      Alert.alert('Logout failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {username ? <Text style={styles.greeting}>Hello, {username}</Text> : null}

      <Button title="Search Businesses" onPress={() => navigation.navigate('Search')} />
      <Button title="My Business" onPress={() => navigation.navigate('MyBusinesses')} />
      <Button title="Create New Business" onPress={() => navigation.navigate('CreateBusiness')} />
      <Button title="Create Slot" onPress={() => navigation.navigate('CreateSlot')} />
      <Button title="My Appointments" onPress={() => navigation.navigate('MyAppointments')} />
      <Button title="Business Appointments" onPress={() => navigation.navigate('BusinessAppointments')} />

      <View style={{ marginTop: 30 }}>
        <Button title="Log Out" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30
  }
});
