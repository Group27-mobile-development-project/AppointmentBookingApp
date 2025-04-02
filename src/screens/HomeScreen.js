import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';

const owners = [
  { id: 1, name: 'Salon ABC' },
  { id: 2, name: 'Spa XYZ' },
];

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Select Supplier</Text>
      <FlatList
        data={owners}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Button
            title={item.name}
            onPress={() => navigation.navigate('Appointment', { owner: item })}
          />
        )}
      />
    </View>
  );
};

export default HomeScreen;
