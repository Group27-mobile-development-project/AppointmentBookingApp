import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
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

  if (loading) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={businesses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Business', { businessId: item.id })}
                style={styles.cardBtn}
              >
                <Text style={styles.cardBtnText}>Manage</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          businesses.length > 0 ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('BusinessAppointments')}
              style={styles.smallFooterBtn}
            >
              <Text style={styles.smallFooterBtnText}>
                All Business Appointments
              </Text>
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateBusiness')}
        style={styles.createBtn}
      >
        <Text style={styles.createBtnText}>Register Business</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8
  },
  cardBtn: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  cardBtnText: {
    color: '#fff',
    fontSize: 13
  },
  smallFooterBtn: {
    alignSelf: 'center',
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  smallFooterBtnText: {
    color: '#fff',
    fontSize: 14,
  },
  createBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
});
