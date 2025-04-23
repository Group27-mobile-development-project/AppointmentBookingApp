// src/screen/SearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  ScrollView, StyleSheet
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function SearchScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id)
        ? prev.filter(cat => cat !== id)
        : [...prev, id]
    );
  };

  const handleSearch = async () => {
    const snapshot = await getDocs(collection(db, 'businesses'));
    const filtered = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(biz => {
        const matchKeyword = keyword.trim() === '' || (
          biz.name?.toLowerCase().includes(keyword.toLowerCase()) ||
          biz.description?.toLowerCase().includes(keyword.toLowerCase())
        );
        const matchCategory =
          selectedCategories.length === 0 ||
          selectedCategories.some(id => biz.category_ids?.includes(id));
        return matchKeyword && matchCategory;
      });

    setResults(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search businesses..."
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={handleSearch}
        style={styles.input}
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Categories</Text>
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => toggleCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategories.includes(cat.id) && styles.categoryChipSelected
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategories.includes(cat.id) && styles.categoryTextSelected
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
        <Text style={styles.searchBtnText}>Search</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.noResults}>No results found.</Text>}
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
                <Text style={styles.cardBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    color: '#000'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#555'
  },
  categoryContainer: {
    marginBottom: 12
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categoryChipSelected: {
    backgroundColor: '#388e3c',
    borderColor: '#2e7d32',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
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
    flex: 1,  // This ensures text takes available space before button
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
    marginLeft: 10,  // Adds space between text and button
  },
  cardBtnText: {
    color: '#fff',
    fontSize: 13
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
    fontSize: 14
  }
});
