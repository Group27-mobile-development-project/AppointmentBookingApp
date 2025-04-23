// src/screen/CreateBusinessScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, StyleSheet,
  Alert, ScrollView, Text, TouchableOpacity, Image
} from 'react-native';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import uuid from 'react-native-uuid';
import pickAndUploadImage from '../components/pickAndUploadImage';

export default function CreateBusinessScreen({ navigation }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [googleCalendarId, setGoogleCalendarId] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [businessId] = useState(uuid.v4());

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    };
    fetchCategories();
  }, []);

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleUploadImage = async () => {
    await pickAndUploadImage(`businesses/${businessId}/cover.jpg`, (url) => {
      setImageUrl(url);
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Business name must not be empty');
      return;
    }

    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('You must be logged in to create a business');
      return;
    }

    const businessRef = doc(db, 'businesses', businessId);

    await setDoc(businessRef, {
      user_id: user.uid,
      category_ids: selectedCategories,
      name,
      description: desc,
      location,
      contact_email: contactEmail || user.email || '',
      contact_phone: contactPhone || user.phoneNumber || '',
      google_calendar_id: googleCalendarId,
      image_url: imageUrl,
      saved_at: serverTimestamp()
    });

    Alert.alert('Your business is created successfully!');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput placeholder="Business Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Description" value={desc} onChangeText={setDesc} style={styles.input} />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      <TextInput placeholder="Contact Email" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Contact Phone" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" style={styles.input} />
      <TextInput placeholder="Google Calendar ID (optional)" value={googleCalendarId} onChangeText={setGoogleCalendarId} style={styles.input} />

      <Text style={styles.label}>Select Categories:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryButton, selectedCategories.includes(cat.id) && styles.categoryButtonSelected]}
            onPress={() => toggleCategory(cat.id)}
          >
            <Text style={selectedCategories.includes(cat.id) ? styles.categoryTextSelected : null}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 16, alignItems: 'center' }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200, marginBottom: 8, borderRadius: 8 }} />
        ) : (
          <Text style={{ marginBottom: 8, fontStyle: 'italic', color: 'gray' }}>No image uploaded</Text>
        )}
        <Button title="Pick and Upload Image" onPress={handleUploadImage} color="#888" />
      </View>

      <Button title="Create Business" onPress={handleCreate} color="#2196f3" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center'
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 4
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  },
  categoryButtonSelected: {
    backgroundColor: '#4caf50',
    borderColor: '#388e3c'
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: 'bold'
  }
});
