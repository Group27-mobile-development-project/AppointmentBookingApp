

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
  const [showServices, setShowServices] = useState(true);

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
    <View>
      <View style={styles.reminderBanner}>
        <Text style={styles.reminderText}>Business Info</Text>
      </View>

      {business?.image_url && (
        <Image source={{ uri: business.image_url }} style={styles.coverImage} />
      )}

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
              style={[styles.categoryButton, selectedCategories.includes(cat.id) && styles.categoryButtonSelected]}
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
        <View>
          <Text>Name: {business?.name}</Text>
          <Text>Description: {business?.description}</Text>
          <Text>Location: {business?.location}</Text>
          <Text>Contact: {business?.contact_email}</Text>
          <Text>Phone: {business?.contact_phone}</Text>
          <Text style={{ marginTop: 8 }}>Categories:</Text>
          {categories
            .filter(cat => (business?.category_ids || []).includes(cat.id))
            .map(cat => <Text key={cat.id}>• {cat.name}</Text>)}

          {isOwner && (
            <TouchableOpacity
              onPress={startEditing}
              style={styles.cardBtn}
            >
              <Text style={styles.cardBtnText}>Edit Info</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isOwner && !editing && (
        <View style={styles.editInfoContainer}>
          <TouchableOpacity
            onPress={handleChangeCoverImage}
            style={styles.coverImageBtn}
          >
            <Text style={styles.coverImageBtnText}>Change Cover Image</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 30 }} />

      <TouchableOpacity
        style={styles.reminderBanner}
        onPress={() => setShowServices(prev => !prev)}
      >
        <Text style={styles.reminderText}>
          {showServices ? '▼ Services' : '▶ Services'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!business) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={renderHeader()}
        data={showServices ? slots : []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.slotCard}
            onPress={() => navigation.navigate('SlotScreen', { businessId, slotId: item.id })}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>Duration: {item.duration_min} min</Text>
            <Text>Status: {item.is_active ? 'Active' : 'Inactive'}</Text>

            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Detail</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={showServices ? <Text>No services yet</Text> : null}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      />

      {isOwner ? (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateSlot', { businessId })}
          style={styles.floatingButton}
        >
          <Text style={styles.floatingButtonText}>Create New Service</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.navigate('Booking', { businessId })}
          style={[styles.floatingButton, { backgroundColor: 'black' }]}
        >
          <Text style={styles.floatingButtonText}>Book Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: 'transparent',
  },
  reminderBanner: {
    backgroundColor: '#343a40',
    paddingVertical: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  slotCard: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#eaeaea',
    borderRadius: 6,
  },
  viewButton: {
    backgroundColor: '#888',
    marginTop: 10,
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoryButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#aaa',
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#4caf50',
    borderColor: '#388e3c',
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  editInfoContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  coverImageBtn: {
    backgroundColor: '#0288d1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  coverImageBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cardBtn: {
    backgroundColor: '#388e3c',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  cardBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'black',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
