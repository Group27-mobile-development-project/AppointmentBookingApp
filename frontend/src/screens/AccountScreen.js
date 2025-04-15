import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AccountScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
