import React from "react";
import { View, Text, Button, FlatList } from "react-native";

const appointments = [
  { id: 1, user: "Nguyễn Văn A", date: "2025-04-10 14:00" },
];

const OwnerScreen = () => {
  return (
    <View>
      <Text style={{ fontSize: 20 }}>Booking list</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>
              {item.user} - {item.date}
            </Text>
            <Button title="Accept" onPress={() => alert("Accepted")} />
            <Button title="Reject" onPress={() => alert("Rejected")} />
          </View>
        )}
      />
    </View>
  );
};

export default OwnerScreen;
