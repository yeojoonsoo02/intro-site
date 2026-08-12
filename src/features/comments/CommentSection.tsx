'use client';

import { useState, useEffect, useCallback } from 'react';
import CommentItem from './CommentItem';
import { Comment } from './comment.model';
import styles from './comment.module.css';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthProvider';

// 목록·작성·삭제 모두 서버 API를 거친다. 브라우저가 Firestore에 직접 붙던 구조는
// googleapis가 차단된 망에서 목록조차 뜨지 않았다. 작성자 검증도 서버에서 하므로
// 클라이언트가 보낸 이름으로 남을 사칭할 수 없다.

export default function CommentSection({ isAdmin }: { isAdmin: boolean }) {
  const [input, setInput] = useState('');
  // 서버 목록과 낙관적 임시 댓글을 분리 관리해 중복 표시 방지
  const [serverComments, setServerComments] = useState<Comment[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user, login } = useAuth();

  const comments: Comment[] = [...pendingComments, ...serverComments];

  const load = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/comments');
      if (!res.ok) throw new Error(`Comments API ${res.status}`);
      const data = (await res.json()) as { comments?: Comment[] };
      setServerComments(data.comments ?? []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 실시간 구독(onSnapshot)은 Firestore 직접 연결이 필요해 포기했다.
  // 댓글 빈도상 진입 시 1회 + 작성 후 갱신으로 충분하다.
  useEffect(() => {
    load();
  }, [load]);

  const addComment = async (): Promise<void> => {
    const text = input.trim();
    if (!text || !user) return;

    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      text,
      author: user.displayName ?? '',
      createdAt: Date.now(),
    };
    setPendingComments((prev) => [tempComment, ...prev]);
    setInput('');

    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`Comments API ${res.status}`);
      await load();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      // 성공이든 실패든 임시 댓글은 걷는다(성공 시엔 서버 목록이 대신 보여준다).
      setPendingComments((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const deleteComment = async (id: string): Promise<void> => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/comments?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(`Comments API ${res.status}`);
      await load();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="w-full">
      {user ? (
        <div className="flex gap-2 mb-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addComment()}
            placeholder={t('commentPlaceholder')}
            aria-label={t('commentPlaceholder')}
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
              date={c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
              onDelete={() => deleteComment(c.id)}
              isAdmin={isAdmin}
            />
          ))
        )}
      </ul>
    </div>
  );
}
