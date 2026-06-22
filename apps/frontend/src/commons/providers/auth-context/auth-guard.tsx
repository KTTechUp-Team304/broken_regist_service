'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { getAccessTokenExpiresAtMs } from '@/commons/auth/access-token';
import { isProtectedPath } from '@/commons/auth/auth-routes';
import { useAuth } from './auth-context';

type GuardStatus = 'checking' | 'allowed';

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, requireLoginAndRedirect, endSessionExpired } = useAuth();
  const [status, setStatus] = useState<GuardStatus>('checking');

  useEffect(() => {
    if (!isProtectedPath(pathname)) {
      setStatus('allowed');
      return;
    }

    const token = localStorage.getItem('accessToken');

    if (!token) {
      requireLoginAndRedirect();
      return;
    }

    if (Date.now() >= getAccessTokenExpiresAtMs(token)) {
      endSessionExpired();
      return;
    }

    if (user) {
      setStatus('allowed');
    } else {
      setStatus('checking');
    }
  }, [pathname, user, requireLoginAndRedirect, endSessionExpired]);

  if (!isProtectedPath(pathname)) {
    return <>{children}</>;
  }

  if (status !== 'allowed' || !user) {
    return null;
  }

  return <>{children}</>;
}
