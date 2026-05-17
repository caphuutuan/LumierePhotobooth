import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export const syncUserProfile = async (user: any) => {
  if (!user) return null;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      phone: user.phoneNumber || '',
      displayName: user.displayName || 'Khách hàng',
      photoURL: user.photoURL || '',
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, newUser);
    return newUser;
  }

  return userDoc.data() as UserProfile;
};

export const getUserRole = async (uid: string): Promise<'admin' | 'user'> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().role || 'user';
  }
  return 'user';
};

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (UserProfile & { id: string })[];
};

export const updateUserRole = async (uid: string, role: 'admin' | 'user') => {
  await updateDoc(doc(db, 'users', uid), { role });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await updateDoc(doc(db, 'users', uid), data);
};
