import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Profile } from './profile.model';

function profileDoc() {
  return doc(db, 'profiles', 'main');
}

function devProfileDoc() {
  return doc(db, 'profiles', 'dev');
}

export async function fetchProfile(): Promise<Profile | null> {
  const snap = await getDoc(profileDoc());
  return snap.exists() ? (snap.data() as Profile) : null;
}

export async function saveProfile(profile: Profile) {
  await setDoc(profileDoc(), profile, { merge: true });
}

export async function fetchDevProfile(): Promise<Profile | null> {
  const snap = await getDoc(devProfileDoc());
  return snap.exists() ? (snap.data() as Profile) : null;
}

export async function saveDevProfile(profile: Profile) {
  await setDoc(devProfileDoc(), profile, { merge: true });
}
