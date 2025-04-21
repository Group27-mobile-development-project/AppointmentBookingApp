import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { db } from '../src/firebaseConfig'
import { collection, doc, setDoc } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'hair-salon', name: 'Hair Salon', description: 'Haircuts, coloring, styling and more' },
  { id: 'nail-salon', name: 'Nail Salon', description: 'Nail art and manicure services' },
  { id: 'spa', name: 'Spa', description: 'Massage, sauna, facial, and other wellness services' },
  { id: 'tattoo', name: 'Tattoo & Piercing', description: 'Tattoo artists and piercing services' },
  { id: 'barber', name: 'Barber Shop', description: 'Men\'s grooming and haircuts' },

  { id: 'doctor', name: 'Doctor Clinic', description: 'Medical appointments with general doctors' },
  { id: 'dentist', name: 'Dental Clinic', description: 'Teeth cleaning, braces, etc.' },
  { id: 'physiotherapy', name: 'Physiotherapy', description: 'Muscle, joint and movement rehab' },
  { id: 'psychologist', name: 'Psychologist / Counselor', description: 'Mental health services' },

  { id: 'trainer', name: 'Personal Trainer', description: 'One-on-one fitness coaching' },
  { id: 'yoga', name: 'Yoga Studio', description: 'Yoga classes for strength and relaxation' },
  { id: 'pilates', name: 'Pilates Studio', description: 'Pilates classes and training' },

  { id: 'tutor', name: 'Private Tutor', description: 'Personal education help' },
  { id: 'language', name: 'Language Center', description: 'Language learning services' },
  { id: 'music', name: 'Music Teacher', description: 'Learn instruments or singing' },
  { id: 'dance', name: 'Dance Instructor', description: 'Dance lessons and choreography' },

  { id: 'plumber', name: 'Plumber', description: 'Water and pipe fixing services' },
  { id: 'electrician', name: 'Electrician', description: 'Electrical installation and repair' },
  { id: 'cleaning', name: 'Cleaning Service', description: 'Home and office cleaning' },

  { id: 'photographer', name: 'Photographer', description: 'Photo sessions and editing' },
  { id: 'developer', name: 'Web Developer', description: 'Build and maintain websites' },

  { id: 'pet-grooming', name: 'Pet Grooming', description: 'Pet hair trimming and bathing' },
  { id: 'vet', name: 'Veterinarian', description: 'Pet healthcare and checkups' },

  { id: 'lawyer', name: 'Lawyer', description: 'Legal consulting and services' },
  { id: 'accountant', name: 'Accountant', description: 'Financial and tax consulting' },

  { id: 'makeup', name: 'Makeup Artist', description: 'Professional makeup services' },
  { id: 'tailor', name: 'Tailor', description: 'Custom clothing and alteration' }
  { id: 'laundry', name: 'Laundry', description: 'Laundry services' }
];

export default function SeedCategoriesScreen() {
  useEffect(() => {
    const seedCategories = async () => {
      const colRef = collection(db, 'categories');
      for (let cat of CATEGORIES) {
        const docRef = doc(colRef, cat.id);
        await setDoc(docRef, {
          name: cat.name,
          description: cat.description
        });
      }
      console.log('Categories seeded!');
    };

    seedCategories();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Seeding categories to Firestore...</Text>
    </View>
  );
}
