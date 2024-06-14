import { initializeApp} from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



export const Firebase = initializeApp(firebaseConfig);
export const auth = getAuth();
export const Providers = { google: new GoogleAuthProvider() };
export const db = getFirestore(Firebase);
export const storage = getStorage(Firebase);