'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CommentItem from './CommentItem';
import { Comment } from './comment.model';
import styles from './comment.module.css';

export default function CommentSection({ isAdmin }: { isAdmin: boolean }) {
  const [input, setInput] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const loadComments = async () => {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];
    setComments(data);
  };

  const addComment = async () => {
    if (!input.trim()) return;
    await addDoc(collection(db, 'comments'), {
      text: input,
      createdAt: Timestamp.now(),
    });
    setInput('');
    loadComments();
  };

  const deleteComment = async (id: string) => {
    await deleteDoc(doc(db, 'comments', id));
    loadComments();
  };

  useEffect(() => {
    loadComments();
  }, []);

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addComment()}
        placeholder="댓글을 입력하세요"
        className={styles.input}
      />

      <ul>
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            text={c.text}
            date={c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : ''}
            onDelete={() => deleteComment(c.id)}
            isAdmin={isAdmin}
          />
        ))}
      </ul>
    </div>
  );
}