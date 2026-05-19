import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export type UserRole = 'master' | 'admin' | 'moderator' | 'editor' | 'staff' | 'user';

export const ROLE_LEVELS: Record<UserRole, number> = {
  master: 100,
  admin: 80,
  moderator: 60,
  editor: 40,
  staff: 20,
  user: 0
};

export const MASTER_EMAIL = 'caphuutuan1@gmail.com';

export interface UserProfile {
  uid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  grantedBy: string | null; // UID of the user who assigned this role
  createdAt: string;
}

export const syncUserProfile = async (user: any) => {
  if (!user) return null;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  const isMaster = user.email === MASTER_EMAIL;

  if (!userDoc.exists()) {
    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      phone: user.phoneNumber || '',
      displayName: user.displayName || 'Khách hàng',
      photoURL: user.photoURL || '',
      role: isMaster ? 'master' : 'user',
      grantedBy: isMaster ? 'SYSTEM' : null,
      createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, newUser);
    return newUser;
  }

  // Auto-upgrade if email matches MASTER_EMAIL but role isn't master
  const existingData = userDoc.data() as UserProfile;
  if (isMaster && existingData.role !== 'master') {
    const updatedData = { ...existingData, role: 'master' as UserRole };
    await updateDoc(userDocRef, { role: 'master' });
    return updatedData;
  }

  return existingData;
};

export const getUserRole = async (uid: string): Promise<UserRole> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().role || 'user';
  }
  return 'user';
};

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ ...doc.data() })) as UserProfile[];
};

export const updateUserRole = async (targetUid: string, role: UserRole, adminUid: string) => {
  await updateDoc(doc(db, 'users', targetUid), { 
    role,
    grantedBy: adminUid 
  });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await updateDoc(doc(db, 'users', uid), data);
};
