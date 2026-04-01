import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';
import { firebaseApp } from './firebaseApp';

export const db = getFirestore(firebaseApp);

// Some mobile browsers do not support IndexedDB persistence reliably.
void enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence disabled');
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence not supported');
  } else {
    console.warn('Firestore persistence unavailable, continuing without it.', err);
  }
});
