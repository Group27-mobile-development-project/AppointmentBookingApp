// src/screens/SearchScreen.js
import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Button } from 'react-native';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function SearchScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    const ref = collection(db, 'businesses');
    const snapshot = await getDocs(ref);

    const filtered = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item =>
        item.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description?.toLowerCase().includes(keyword.toLowerCase())
      );

    setResults(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for business names and descriptions..."
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={handleSearch}
        style={styles.input}
      />
      <Button title="Search" onPress={handleSearch} />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Button
              title="View Detail"
              onPress={() => navigation.navigate('Booking', { businessId: item.id })}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noResult}>No Results</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    borderRadius: 4
  },
  resultCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16
  },
  noResult: {
    marginTop: 20,
    textAlign: 'center',
    color: 'gray'
  }
});
