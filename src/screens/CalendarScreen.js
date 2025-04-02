import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getCalendarEvents } from '../services/GoogleCalendar';

const CalendarScreen = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getCalendarEvents();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <View>
      <Text style={{ fontSize: 20 }}>Your Calendar</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.summary} - {item.start.dateTime}</Text>
        )}
      />
    </View>
  );
};

export default CalendarScreen;
