import { Timestamp } from 'firebase/firestore';

export type Comment = {
  id: string;
  text: string;
  author?: string;
  createdAt: Timestamp;
};