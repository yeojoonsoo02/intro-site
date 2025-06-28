// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: ReturnType<typeof initializeApp> | undefined;
let authInstance: ReturnType<typeof getAuth> | undefined;

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
}

export const db: ReturnType<typeof getFirestore> = app
  ? getFirestore(app)
  : (undefined as unknown as ReturnType<typeof getFirestore>);
export const auth: ReturnType<typeof getAuth> = authInstance
  ? authInstance
  : (undefined as unknown as ReturnType<typeof getAuth>);
export const provider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged };
