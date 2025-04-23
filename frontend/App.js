// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateBusinessScreen from './src/screens/CreateBusinessScreen';
import MyBusinessesScreen from './src/screens/MyBusinessesScreen';
import SearchScreen from './src/screens/SearchScreen';
import BookingScreen from './src/screens/BookingScreen';
import CalendarViewScreen from './src/screens/CalendarViewScreen';
import CreateSlotScreen from './src/screens/CreateSlotScreen';
import MyAppointmentsScreen from './src/screens/MyAppointmentsScreen';
import BusinessAppointmentsScreen from './src/screens/BusinessAppointmentsScreen'
import BusinessScreen from './src/screens/BusinessScreen';

// ...


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateBusiness" component={CreateBusinessScreen} />
        <Stack.Screen name="MyBusinesses" component={MyBusinessesScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="CreateSlot" component={CreateSlotScreen} />
        <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
        <Stack.Screen name="BusinessAppointments" component={BusinessAppointmentsScreen} />
        <Stack.Screen name="Business" component={BusinessScreen} />
        <Stack.Screen name="CalendarView" component={CalendarViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
