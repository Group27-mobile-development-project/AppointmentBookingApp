import React, { useState, useEffect } from 'react';
import {
  View, TextInput, FlatList, Text, StyleSheet, Button, TouchableOpacity, ScrollView
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function SearchScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

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

  const handleSearch = async () => {
    const snapshot = await getDocs(collection(db, 'businesses'));

    const filtered = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => {
        const matchText =
          item.name?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.description?.toLowerCase().includes(keyword.toLowerCase());

        const matchCategory =
          selectedCategories.length === 0 ||
          selectedCategories.some(cat => item.category_ids?.includes(cat));

        return matchText && matchCategory;
      });

    setResults(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by business name or description..."
        value={keyword}
        onChangeText={setKeyword}
        style={styles.input}
        onSubmitEditing={handleSearch}
      />

      <Text style={styles.filterLabel}>Filter by categories:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategories.includes(cat.id) && styles.categorySelected
            ]}
            onPress={() => toggleCategory(cat.id)}
          >
            <Text style={selectedCategories.includes(cat.id) ? styles.selectedText : null}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
              onPress={() => navigation.navigate('Business', { businessId: item.id })}
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
    marginBottom: 8,
    borderRadius: 4
  },
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  categoryButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  },
  categorySelected: {
    backgroundColor: '#4caf50',
    borderColor: '#388e3c'
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold'
  },
  resultCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 10,
  }
})