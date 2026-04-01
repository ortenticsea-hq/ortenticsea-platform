import { getFunctions } from 'firebase/functions';
import { firebaseApp } from './firebaseApp';

export const functions = getFunctions(firebaseApp);
