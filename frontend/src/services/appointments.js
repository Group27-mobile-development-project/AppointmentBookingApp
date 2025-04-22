// File: services/appointments.js
import { getDocs, getDoc, query, where, collection, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

export const fetchUserAppointments = async () => {
  const user = getAuth().currentUser;
  if (!user) {
    console.warn('No authenticated user');
    return [];
  }

  const q = query(
    collection(db, 'appointments'),
    where('user_id', '==', user.uid)
  );

  const snapshot = await getDocs(q);
  const enriched = await Promise.all(snapshot.docs.map(async docSnap => {
    const data = docSnap.data();

    const slotRef = doc(db, 'businesses', data.business_id, 'slots', data.slot_id);
    const slotSnap = await getDoc(slotRef);
    const slotName = slotSnap.exists() ? slotSnap.data().name : 'Unknown Slot';

    const bizRef = doc(db, 'businesses', data.business_id);
    const bizSnap = await getDoc(bizRef);
    const businessData = bizSnap.exists() ? bizSnap.data() : null;
    const businessName = businessData ? businessData.name : 'Unknown Business';
    const businessOwnerId = businessData?.user_id;

    const userRef = doc(db, 'users', data.user_id);
    const userSnap = await getDoc(userRef);
    const customerName = userSnap.exists() ? userSnap.data().name : 'Unknown Customer';

    const servicerRef = businessOwnerId ? doc(db, 'users', businessOwnerId) : null;
    const servicerSnap = servicerRef ? await getDoc(servicerRef) : null;
    const servicerName = servicerSnap?.exists() ? servicerSnap.data().name : 'Unknown Servicer';

    return {
      id: docSnap.id,
      ...data,
      businessName,
      slotName,
      customerName,
      servicerName
    };
  }));

  return enriched;
};
