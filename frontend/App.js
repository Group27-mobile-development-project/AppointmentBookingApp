import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, Text, Dimensions, StyleSheet } from 'react-native';

// Import screens (assuming you've already created these)
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateBusinessScreen from './src/screens/CreateBusinessScreen';
import MyBusinessesScreen from './src/screens/MyBusinessesScreen';
import SearchScreen from './src/screens/SearchScreen';
import BookingScreen from './src/screens/BookingScreen';
import CreateSlotScreen from './src/screens/CreateSlotScreen';
import MyAppointmentsScreen from './src/screens/MyAppointmentsScreen';
import BusinessAppointmentsScreen from './src/screens/BusinessAppointmentsScreen';
import BusinessScreen from './src/screens/BusinessScreen';
import AccountScreen from './src/screens/AccountScreen';

// Get screen dimensions for responsiveness
const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 400; // For detecting larger devices (like tablets)

// Define the stack and tab navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator component
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Search':
              iconName = 'search';
              break;
            case 'My Business':
              iconName = 'briefcase';
              break;
            case 'Account':
              iconName = 'person';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="My Business" component={MyBusinessesScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="CreateBusiness" component={CreateBusinessScreen} />
          <Stack.Screen name="MyBusinesses" component={MyBusinessesScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="CreateSlot" component={CreateSlotScreen} />
          <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
          <Stack.Screen name="BusinessAppointments" component={BusinessAppointmentsScreen} />
          <Stack.Screen name="Business" component={BusinessScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}
