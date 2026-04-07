'use client';

import { useAuth } from '@/lib/AuthProvider';

const ADMIN_EMAIL = 'yeojoonsoo02@gmail.com';

export function useAdminAuth() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user && user.email === ADMIN_EMAIL;

  return { isAuthenticated, loading, ready: !loading };
}
