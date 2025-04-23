import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut, updatePassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AccountScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const sub =
          (await AsyncStorage.getItem('google_sub')) ||
          (await AsyncStorage.getItem('userId'));
        if (!sub) return;

        const userDoc = await getDoc(doc(db, 'users', sub));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.name || '');
          setEmail(data.email || '');
        }
      } catch (err) {
        console.error('Fail to get user info', err);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      await AsyncStorage.clear();
      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Logout failed', err.message);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      const user = getAuth().currentUser;
      await updatePassword(user, newPassword);
      setModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password updated successfully!');
    } catch (err) {
      Alert.alert('Update failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>
      {username ? <Text style={styles.greeting}>Hello, {username}</Text> : null}
      {email ? <Text style={styles.email}>Email: {email}</Text> : null}

      <View style={styles.actions}>
        <Button
          title="My Appointments"
          onPress={() => navigation.navigate('MyAppointments')}
        />
        <Button
          title="Business Appointments"
          onPress={() => navigation.navigate('BusinessAppointments')}
        />
        <Button
          title="Change Password"
          onPress={() => setModalVisible(true)}
        />
        <View style={{ marginTop: 16 }}>
          <Button title="Log Out" color="red" onPress={handleLogout} />
        </View>
      </View>

      {/* Changing password */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
            />
            <Button title="Submit" onPress={handleChangePassword} />
            <View style={{ marginTop: 8 }}>
              <Button
                title="Cancel"
                color="gray"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 18,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  actions: {
    width: '80%',
    gap: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});
