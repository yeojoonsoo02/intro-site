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
import { useTranslation } from 'next-i18next';

export default function CommentSection({ isAdmin }: { isAdmin: boolean }) {
  const [input, setInput] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const loadComments = async () => {
    setLoading(true);
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];
    setComments(data);
    setLoading(false);
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
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              addComment();
            }
          }}
          placeholder={t('commentPlaceholder')}
          className={
            styles.input +
            ' flex-1 bg-card text-[color:var(--foreground)] border border-[color:var(--input-border)] placeholder:text-[color:var(--muted)] resize-none'
          }
          maxLength={100}
          rows={2}
        />
        <button
          onClick={addComment}
          className="bg-[color:var(--primary)] text-[color:var(--primary-contrast)] px-4 py-2 rounded-lg hover:bg-[color:var(--button-hover)] transition text-sm font-semibold min-w-[44px]"
          aria-label={t('submit')}
        >
          {t('submit')}
        </button>
      </div>
      <ul className="space-y-2">
        {loading ? (
          <li className="text-center text-muted py-4">{t('loadingComments')}</li>
        ) : comments.length === 0 ? (
          <li className="text-center text-muted py-4">{t('noComments')}</li>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              text={c.text}
              date={c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : ''}
              onDelete={() => deleteComment(c.id)}
              isAdmin={isAdmin}
            />
          ))
        )}
      </ul>
    </div>
  );
}