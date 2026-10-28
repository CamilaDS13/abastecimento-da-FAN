import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

export const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

export interface CloudVehicleData {
  registros: any[];
  metaKmOleo?: number;
  ultimaTrocaKmOleo?: number;
  updatedAt: string;
  deviceSource?: string;
}

export const syncToCloud = async (data: Partial<CloudVehicleData>) => {
  try {
    const docRef = doc(db, 'vehicles', 'fan2013');
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error syncing to cloud:', error);
    return false;
  }
};

export const subscribeToCloud = (onUpdate: (data: CloudVehicleData) => void) => {
  const docRef = doc(db, 'vehicles', 'fan2013');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as CloudVehicleData;
      onUpdate(data);
    }
  }, (error) => {
    console.warn('Firestore snapshot listener warning:', error);
  });
};
