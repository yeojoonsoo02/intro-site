'use client';

import { useState } from 'react';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authenticate = async (password: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        return true;
      }
      setError('wrongPassword');
      return false;
    } catch {
      setError('errorOccurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setIsAuthenticated(false);

  return { isAuthenticated, loading, error, authenticate, logout };
}
