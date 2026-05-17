import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

export interface GlobalSettings {
  eventTypes: string[];
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  faviconUrl: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

const SETTINGS_DOC_ID = 'global';
const SETTINGS_COLLECTION = 'settings';

export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        socialLinks: data.socialLinks || {}
      } as GlobalSettings;
    } else {
      // Default settings if not exists
      const defaults: GlobalSettings = {
        eventTypes: ['Tiệc cưới', 'Sinh nhật', 'Sự kiện công ty', 'Kỷ niệm', 'Workshop', 'Khác'],
        siteName: 'LUMIÈRE',
        contactEmail: 'contact@lumiere.vn',
        contactPhone: '0901 234 567',
        logoUrl: '',
        faviconUrl: '',
        address: '123 Đường ABC, Quận 1, TP. HCM',
        socialLinks: {
          facebook: 'https://facebook.com/lumiere',
          instagram: 'https://instagram.com/lumiere'
        }
      };
      await setDoc(docRef, defaults);
      return defaults;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return { 
      eventTypes: ['Tiệc cưới', 'Sinh nhật', 'Sự kiện công ty', 'Khác'],
      siteName: 'LUMIÈRE',
      contactEmail: '',
      contactPhone: '',
      logoUrl: '',
      faviconUrl: '',
      address: '',
      socialLinks: {}
    };
  }
};

export const updateGlobalSettings = async (settings: Partial<GlobalSettings>) => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await updateDoc(docRef, settings);
};

export const addEventType = async (type: string) => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await updateDoc(docRef, {
    eventTypes: arrayUnion(type)
  });
};

export const removeEventType = async (type: string) => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await updateDoc(docRef, {
    eventTypes: arrayRemove(type)
  });
};

export const updateEventTypes = async (types: string[]) => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await updateDoc(docRef, {
    eventTypes: types
  });
};
