'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { fetchMe } from '@/commons/api/auth-api';
import { hasStoredAccessToken } from '@/commons/api/auth-fetch';
import { getAccessTokenExpiresAtMs } from '@/commons/auth/access-token';
import { useAuth } from './auth-context';

export function AuthSessionLoader({ children }: { children: ReactNode }) {
  const { user, setSessionFromProfile, endSessionExpired } = useAuth();

  useEffect(() => {
    if (user) {
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }
    if (Date.now() >= getAccessTokenExpiresAtMs(token)) {
      endSessionExpired();
    }
  }, [user, endSessionExpired]);

  const { data, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: !user && hasStoredAccessToken(),
    staleTime: 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }
    setSessionFromProfile(data, accessToken);
  }, [data, setSessionFromProfile]);

  useEffect(() => {
    if (isError) {
      endSessionExpired();
    }
  }, [isError, endSessionExpired]);

  return children;
}
