import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Profile } from './profile.model';

function profileDoc(lang: string = 'en') {
  return doc(db, 'profiles', `main_${lang}`);
}

function devProfileDoc(lang: string = 'en') {
  return doc(db, 'profiles', `dev_${lang}`);
}

export async function fetchProfile(lang: string = 'en'): Promise<Profile | null> {
  const snap = await getDoc(profileDoc(lang));
  return snap.exists() ? (snap.data() as Profile) : null;
}

export async function saveProfile(profile: Profile, lang: string = 'en') {
  await setDoc(profileDoc(lang), profile, { merge: true });
}

export async function fetchDevProfile(lang: string = 'en'): Promise<Profile | null> {
  const snap = await getDoc(devProfileDoc(lang));
  return snap.exists() ? (snap.data() as Profile) : null;
}

export async function saveDevProfile(profile: Profile, lang: string = 'en') {
  await setDoc(devProfileDoc(lang), profile, { merge: true });
}
