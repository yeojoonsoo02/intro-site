'use client';

import { useState, useEffect } from 'react';

const SESSION_KEY = 'admin_authenticated';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setIsAuthenticated(true);
    }
    setReady(true);
  }, []);

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
        sessionStorage.setItem(SESSION_KEY, 'true');
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

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, error, ready, authenticate, logout };
}
