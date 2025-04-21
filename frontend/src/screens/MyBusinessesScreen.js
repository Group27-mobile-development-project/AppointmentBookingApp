// src/screens/MyBusinessesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';

export default function MyBusinessesScreen({ navigation }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'businesses'),
        where('user_id', '==', user.uid)
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
            <Button
              title="View Detail"
              onPress={() => navigation.navigate('Business', { businessId: item.id })}
            />            
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
