import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface BookingData {
  name: string;
  email?: string;
  phone: string;
  date: string;
  eventType: string;
  message: string;
}

export const submitBooking = async (data: BookingData) => {
  try {
    await addDoc(collection(db, 'bookings'), {
      ...data,
      status: 'new',
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error submitting booking:', error);
    return { success: false, error };
  }
};
