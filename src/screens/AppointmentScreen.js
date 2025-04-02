import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { createAppointment } from '../services/GoogleCalendar';

const AppointmentScreen = ({ route, navigation }) => {
  const { owner } = route.params;
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const handleBooking = async () => {
    await createAppointment(owner.name, date, note);
    alert('Booking successful!');
    navigation.goBack();
  };

  return (
    <View>
      <Text style={{ fontSize: 18 }}>Booking with: {owner.name}</Text>
      <TextInput placeholder="Input date - time (YYYY-MM-DDTHH:MM:SS)" onChangeText={setDate} />
      <TextInput placeholder="Write your note:" onChangeText={setNote} />
      <Button title="Confirm" onPress={handleBooking} />
    </View>
  );
};

export default AppointmentScreen;
