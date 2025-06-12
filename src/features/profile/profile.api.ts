import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Profile } from './profile.model';

const PROFILE_DOC = doc(db, 'profiles', 'main');

export async function fetchProfile(): Promise<Profile | null> {
  const snap = await getDoc(PROFILE_DOC);
  return snap.exists() ? (snap.data() as Profile) : null;
}

export async function saveProfile(profile: Profile) {
  await setDoc(PROFILE_DOC, profile, { merge: true });
}
