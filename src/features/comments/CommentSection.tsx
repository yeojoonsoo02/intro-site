'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
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
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthProvider';

export default function CommentSection({ isAdmin }: { isAdmin: boolean }) {
  const [input, setInput] = useState('');
  // 서버 구독 댓글(onSnapshot 소스)과 낙관적 임시 댓글을 분리 관리해 중복 표시 방지
  const [serverComments, setServerComments] = useState<Comment[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user, login } = useAuth();

  // 화면 표시용: 아직 서버에 미반영된 임시 댓글 + 서버 댓글(최신순). 동일 임시 제거.
  const comments: Comment[] = [...pendingComments, ...serverComments];

  const addComment = async () => {
    if (!input.trim() || !user) return;
    const text = input;
    const author = user.displayName || user.email || '';
    const tempId = `temp-${Date.now()}`;
    const now = Timestamp.now();

    const tempComment: Comment = {
      id: tempId,
      text,
      author,
      createdAt: now,
    };
    // 즉시 반영(낙관적). onSnapshot이 서버 문서를 받으면 이 임시 댓글은 제거.
    setPendingComments((prev) => [tempComment, ...prev]);
    setInput('');

    try {
      await addDoc(collection(db, 'comments'), {
        text,
        author,
        createdAt: now,
      });
      // 실제 문서는 onSnapshot으로 들어오므로 임시 댓글 제거(중복 방지)
      setPendingComments((prev) => prev.filter((c) => c.id !== tempId));
    } catch (err) {
      console.error('Failed to add comment:', err);
      // Rollback
      setPendingComments((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const deleteComment = async (id: string) => {
    try {
      // 서버 삭제는 onSnapshot이 목록에 반영. 실패 시 별도 롤백 불필요(구독이 진실 소스).
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // 실시간 구독: 타 클라이언트의 추가/삭제도 즉시 반영. cleanup에서 unsubscribe.
  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Comment[];
        setServerComments(data);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to subscribe comments:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full">
      {user ? (
        <div className="flex gap-2 mb-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addComment()}
            placeholder={t('commentPlaceholder')}
            className={
              styles.input +
              " flex-1 bg-card text-[color:var(--foreground)] border border-[color:var(--input-border)] placeholder:text-[color:var(--muted)]"
            }
            maxLength={100}
          />
          <button
            onClick={addComment}
            className="bg-[color:var(--primary)] text-[color:var(--primary-contrast)] px-4 py-2 rounded-lg hover:bg-[color:var(--button-hover)] transition text-sm font-semibold min-w-[44px]"
            aria-label={t('submit')}
          >
            {t('submit')}
          </button>
        </div>
      ) : (
        <button
          onClick={() => login()}
          className="w-full mb-2 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            color: 'var(--primary)',
            border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
          }}
        >
          {t('loginToComment')}
        </button>
      )}
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
              author={c.author}
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
