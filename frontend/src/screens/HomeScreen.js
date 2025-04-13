// src/screens/HomeScreen.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
        <Button
        title="Search Businesses"
        onPress={() => navigation.navigate('Search')}
        />
        <Button
            title="My Business"
            onPress={() => navigation.navigate('MyBusinesses')}
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
    justifyContent: 'center',
    alignItems: 'center',
  }
});
