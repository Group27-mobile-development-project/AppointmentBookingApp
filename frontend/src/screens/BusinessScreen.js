import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, TextInput, FlatList, StyleSheet,
  Alert, TouchableOpacity, Image
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import pickAndUploadImage from '../components/pickAndUploadImage';

export default function BusinessScreen({ route, navigation }) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Editable fields state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    fetchBusinessData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const catList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(catList);
  };

  const fetchBusinessData = async () => {
    const currentUser = getAuth().currentUser;
    if (!businessId || !currentUser) return;

    const businessRef = doc(db, 'businesses', businessId);
    const businessSnap = await getDoc(businessRef);

    if (businessSnap.exists()) {
      const bizData = businessSnap.data();
      setBusiness(bizData);
      setSelectedCategories(bizData.category_ids || []);
      setIsOwner(currentUser.uid === bizData.user_id);
    }

    const slotSnap = await getDocs(collection(db, 'businesses', businessId, 'slots'));
    const slotList = slotSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSlots(slotList);
  };

  const startEditing = () => {
    setName(business.name || '');
    setDescription(business.description || '');
    setLocation(business.location || '');
    setContactEmail(business.contact_email || '');
    setContactPhone(business.contact_phone || '');
    setEditing(true);
  };

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  const handleUpdateBusiness = async () => {
    try {
      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, {
        name,
        description,
        location,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        category_ids: selectedCategories
      });
      Alert.alert('Business updated successfully!');
      setBusiness({
        ...business,
        name,
        description,
        location,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        category_ids: selectedCategories
      });
      setEditing(false);
    } catch (err) {
      Alert.alert('Update failed', err.message);
    }
  };

  const handleChangeCoverImage = async () => {
    await pickAndUploadImage(`businesses/${businessId}/cover.jpg`, async (url) => {
      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, { image_url: url });
      setBusiness(prev => ({ ...prev, image_url: url }));
    });
  };

  const renderHeader = () => (
    <>
      {business.image_url && (
        <Image source={{ uri: business.image_url }} style={styles.coverImage} />
      )}
      {isOwner && (
        <TouchableOpacity onPress={handleChangeCoverImage} style={styles.changeImageBtn}>
          <Text style={{ color: '#2196f3' }}>Change Cover Image</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>Business Info</Text>

      {editing ? (
        <>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" />
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />
          <TextInput style={styles.input} value={contactEmail} onChangeText={setContactEmail} placeholder="Email" />
          <TextInput style={styles.input} value={contactPhone} onChangeText={setContactPhone} placeholder="Phone" />

          <Text style={styles.subTitle}>Select Categories</Text>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategories.includes(cat.id) && styles.categoryButtonSelected
              ]}
              onPress={() => toggleCategory(cat.id)}
            >
              <Text style={selectedCategories.includes(cat.id) ? styles.categoryTextSelected : null}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
          <Button title="Save" onPress={handleUpdateBusiness} color="#2196f3" />
        </>
      ) : (
        <>
          <Text>Name: {business.name}</Text>
          <Text>Description: {business.description}</Text>
          <Text>Location: {business.location}</Text>
          <Text>Contact: {business.contact_email} | {business.contact_phone}</Text>
          <Text style={{ marginTop: 8 }}>Categories:</Text>
          {categories
            .filter(cat => (business.category_ids || []).includes(cat.id))
            .map(cat => <Text key={cat.id}>• {cat.name}</Text>)}
          {isOwner && <Button title="Edit Info" onPress={startEditing} />}
        </>
      )}

      <Text style={styles.title}>Services</Text>
    </>
  );

  if (!business) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          {renderHeader()}
        </View>
      }
      data={slots}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.slotCard}>
          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>Duration: {item.duration_min} min</Text>
        </View>
      )}
      ListEmptyComponent={<Text>No services yet</Text>}
      ListFooterComponent={
        <View style={styles.footer}>
          {isOwner ? (
            <Button
              title="Create New Service"
              onPress={() => navigation.navigate('CreateSlot', { businessId })}
              color="#4caf50"
            />
          ) : (
            <Button
              title="Book Now"
              onPress={() => navigation.navigate('Booking', { businessId })}
              color="#3b82f6"
            />
          )}
        </View>
      }
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    />
  );
   
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80
  },
  headerContainer: {
    marginBottom: 16
  },
  footer: {
    marginTop: 16,
    marginBottom: 80
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8
  },
  subTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 4
  },
  slotCard: {
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#eee',
    borderRadius: 6
  },
  categoryButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#aaa',
    marginBottom: 8
  },
  categoryButtonSelected: {
    backgroundColor: '#4caf50',
    borderColor: '#388e3c'
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: 'bold'
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12
  },
  changeImageBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8
  }
});
