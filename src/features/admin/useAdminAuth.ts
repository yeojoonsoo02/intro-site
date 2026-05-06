'use client';

import { useAuth } from '@/lib/AuthProvider';

// admin 권한 체크는 AuthProvider의 isAdmin을 단일 원천으로 사용.
// 이 훅은 ready 같은 admin 페이지 전용 의미를 추가하기 위한 어댑터.
export function useAdminAuth() {
  const { isAdmin, loading } = useAuth();
  return { isAuthenticated: isAdmin, loading, ready: !loading };
}
