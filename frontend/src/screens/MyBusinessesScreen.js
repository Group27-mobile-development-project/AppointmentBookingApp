// src/screens/MyBusinessesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyBusinessesScreen({ navigation }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const googleSub = await AsyncStorage.getItem('google_sub');
      if (!googleSub) return;

      const q = query(
        collection(db, 'businesses'),
        where('user_id', '==', googleSub)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBusinesses(results);
      setLoading(false);
    };

    fetchBusinesses();
  }, []);

  if (loading) return <Text style={{ textAlign: 'center' }}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.businessCard}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        )}
      />
      <Button
        title="Create New Business"
        onPress={() => navigation.navigate('CreateBusiness')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  businessCard: {
    backgroundColor: '#eee',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16
  },
  desc: {
    fontSize: 14
  }
});
