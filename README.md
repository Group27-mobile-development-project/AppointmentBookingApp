# BookingApp 🗕️

**BookingApp** is a mobile application built with **React Native** and **Expo** that allows users to search for service providers, book appointments, and manage their bookings easily. The platform also supports businesses to offer and manage their services efficiently.

---

## Features 🚀
- Email/Password Authentication and Google Sign-In
- Service Search and Filtering by Category
- Appointment Booking System
- User Calendar View (Agenda)
- Business Management Dashboard
- Promotions and Loyalty (planned)
- In-app Advertising (planned)

---

## Tech Stack 🔧
- **React Native (Expo)**
- **Firebase (Authentication, Firestore, Storage)**
- **Luxon** for timezone handling
- **React Native Calendars** (Agenda View)
- **React Native Modal Datetime Picker**

---

## Future Improvements 🌟
- Provider Verification System
- Promotions and Discount Management
- Loyalty Points System
- In-App Advertising (Banner Ads)
- Google Calendar Integration
- Review and Rating System

---

## Known Issues ⚠️
- No payment gateway integration yet
- Admin approval system not yet implemented
- No push notifications for upcoming appointments

---

## Installation 🛠️

1. Clone the repository:
   ```bash
   git clone https://github.com/yourname/BookingApp.git
   cd BookingApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a `.env` file at the project root and add:
     ```env
     FIREBASE_API_KEY=your_key
     FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     FIREBASE_PROJECT_ID=your_project
     FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     FIREBASE_APP_ID=your_app_id
     FIREBASE_MEASUREMENT_ID=your_measurement_id
     EXPO_CLIENT_ID=your_expo_client_id
     ANDROID_CLIENT_ID=your_android_client_id
     ```

4. Run the project:
   ```bash
   npx expo start
   ```

---

## Database Structure 📔️

```
users/
  └── {userId}
      └── google_tokens/{tokenId}

businesses/
  └── {businessId}
      └── slots/{slotId}

categories/
  └── {categoryId}

appointments/
  └── {appointmentId}
```

---

## Important Files 📄
- `firebaseConfig.js` – Firebase setup (Auth, Firestore, Storage)
- `src/screens/` – App screens (Login, Home, Search, Booking, Account, etc.)
- `src/auth/useEmailAuth.js` – Email Authentication logic
- `src/services/appointments.js` – Appointment fetching services

---

## Main Screens 📱
- **LoginScreen** – User authentication
- **HomeScreen** – View next appointment
- **SearchScreen** – Find services
- **BookingScreen** – Book appointments
- **AccountScreen** – Manage user profile
- **CalendarViewScreen** – Calendar overview
- **BusinessScreen** – Manage business and slots
- **MyAppointmentsScreen** – View upcoming and past appointments

---

## Authentication 🔐
- **Email/Password Authentication**
- **Google OAuth Login**
- **Email Verification** enforced before login
- **Session Persistence** using AsyncStorage

---

## Project Structure 📂
```
BookingApp/
├── src/
│   ├── auth/
│   ├── components/
│   ├── screens/
│   └── services/
├── firebaseConfig.js
├── App.js
├── package.json
└── README.md
```

---

## Notes 📌
- Appointment status flow: `pending -> confirmed -> completed/cancelled`
- Booking conflict checking is implemented based on timeslots and Luxon.
- Promotions and loyalty points features are planned for future phases.
- In-app advertising is planned for Phase 2.

---

## License 📜
This project was developed for educational purposes only.

All third-party libraries and dependencies used in this project are licensed under their respective open-source licenses.

### Main Libraries and Their Licenses:
- [React Native](https://github.com/facebook/react-native) — [MIT License](https://opensource.org/licenses/MIT)
- [Expo](https://github.com/expo/expo) — [MIT License](https://opensource.org/licenses/MIT)
- [Firebase SDK for JavaScript](https://github.com/firebase/firebase-js-sdk) — [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [Luxon](https://github.com/moment/luxon) — [MIT License](https://opensource.org/licenses/MIT)
- [react-native-calendars](https://github.com/wix/react-native-calendars) — [MIT License](https://opensource.org/licenses/MIT)
- [react-native-modal-datetime-picker](https://github.com/mmazzarolo/react-native-modal-datetime-picker) — [MIT License](https://opensource.org/licenses/MIT)
- [@react-navigation](https://github.com/react-navigation/react-navigation) — [MIT License](https://opensource.org/licenses/MIT)
- [AsyncStorage (react-native-async-storage)](https://github.com/react-native-async-storage/async-storage) — [MIT License](https://opensource.org/licenses/MIT)

---

Please refer to each library’s official repository for full license details.

---

# Made by Group 27 (Bao Nguyen, Danh Do, Vu Vo)

