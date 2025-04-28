import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
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

  const CustomButton = ({ title, onPress, backgroundColor = '#000' }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.customButton, { backgroundColor }]}
    >
      <Text style={styles.customButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>

      {/* Account Banner */}
      <View style={styles.reminderBanner}>
        <Text style={styles.reminderText}>{username}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.profileContainer}>
            <View style={styles.profilePic} />
            <Text style={styles.email}>{email}</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>

          <CustomButton
            title="Change Password"
            onPress={() => setModalVisible(true)}
          />
          <CustomButton
            title="Log Out"
            backgroundColor="red"
            onPress={handleLogout}
          />
        </View>
      </View>

      {/* Changing password modal */}
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
              placeholderTextColor="#888"
            />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#888"
            />
            <CustomButton title="Submit" onPress={handleChangePassword} />
            <CustomButton
              title="Cancel"
              backgroundColor="gray"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,       
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'right', 
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
    overflow: 'hidden',
    marginTop: 0,
  },
  cardContent: {
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 30,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  editProfileText: {
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  customButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  customButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#000',
  },
});
