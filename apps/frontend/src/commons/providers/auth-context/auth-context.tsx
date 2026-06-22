'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { MeResponse } from '@/commons/api/auth-api';
import { refreshAccessTokenManually, setAuthFetchHandlers } from '@/commons/api/auth-fetch';
import { getAccessTokenExpiresAtMs } from '@/commons/auth/access-token';

const LOGIN_REQUIRED_MESSAGE = '로그인이 필요합니다.';
const SESSION_EXPIRED_MESSAGE = '세션이 만료되었습니다. 다시 로그인 해 주세요.';

function shouldSkipSessionRedirect(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  const path = window.location.pathname;
  return path === '/login' || path === '/register';
}

interface LoginResponse {
  id: number;
  username: string;
  role: string;
  createdAt: string;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  token: string;
  registeredAt: string;
  major: string;
  advisor: string;
  grade: number;
}

interface AuthContextType {
  user: User | null;
  sessionSecondsLeft: number | null;
  isExtendingSession: boolean;
  login: (username: string, password: string) => Promise<string>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setSessionFromProfile: (profile: MeResponse, accessToken: string) => void;
  clearSession: () => void;
  extendSession: () => Promise<void>;
  requireLoginAndRedirect: () => void;
  endSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatRegisteredAt(createdAt: string): string {
  return createdAt.includes('T') ? createdAt.split('T')[0] : createdAt;
}

function toUser(profile: MeResponse | LoginResponse, accessToken: string): User {
  return {
    id: profile.id,
    username: profile.username,
    role: profile.role,
    token: accessToken,
    registeredAt: formatRegisteredAt(profile.createdAt),
    major: '컴퓨터공학',
    advisor: '김교수',
    grade: 4,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number | null>(null);
  const [isExtendingSession, setIsExtendingSession] = useState(false);
  const sessionEndedRef = useRef(false);

  const clearSession = useCallback(() => {
    sessionEndedRef.current = false;
    setUser(null);
    setSessionExpiresAt(null);
    setSessionSecondsLeft(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const resetSessionTimer = useCallback((accessToken: string) => {
    sessionEndedRef.current = false;
    setSessionExpiresAt(getAccessTokenExpiresAtMs(accessToken));
  }, []);

  const redirectToLogin = useCallback((message: string) => {
    if (sessionEndedRef.current) {
      return;
    }
    sessionEndedRef.current = true;
    setSessionExpiresAt(null);
    setSessionSecondsLeft(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    if (shouldSkipSessionRedirect()) {
      return;
    }
    alert(message);
    window.location.href = '/login';
  }, []);

  const requireLoginAndRedirect = useCallback(() => {
    redirectToLogin(LOGIN_REQUIRED_MESSAGE);
  }, [redirectToLogin]);

  const endSessionExpired = useCallback(() => {
    redirectToLogin(SESSION_EXPIRED_MESSAGE);
  }, [redirectToLogin]);

  const setSessionFromProfile = useCallback(
    (profile: MeResponse, accessToken: string) => {
      setUser(toUser(profile, accessToken));
      resetSessionTimer(accessToken);
    },
    [resetSessionTimer],
  );

  const extendSession = useCallback(async () => {
    if (sessionEndedRef.current) {
      return;
    }

    setIsExtendingSession(true);
    try {
      const newAccessToken = await refreshAccessTokenManually();
      setUser((prev) => (prev ? { ...prev, token: newAccessToken } : prev));
      resetSessionTimer(newAccessToken);
    } catch {
      endSessionExpired();
    } finally {
      setIsExtendingSession(false);
    }
  }, [resetSessionTimer, endSessionExpired]);

  useEffect(() => {
    setAuthFetchHandlers({
      onAccessTokenRefreshed: (accessToken) => {
        setUser((prev) => (prev ? { ...prev, token: accessToken } : prev));
        resetSessionTimer(accessToken);
      },
    });

    return () => setAuthFetchHandlers({});
  }, [resetSessionTimer]);

  useEffect(() => {
    if (!user || sessionExpiresAt === null) {
      setSessionSecondsLeft(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 1000));
      setSessionSecondsLeft(left);

      if (left <= 0 && !sessionEndedRef.current) {
        endSessionExpired();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [user, sessionExpiresAt, endSessionExpired]);

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, passwordHash: password }),
    });

    if (!res.ok) {
      throw new Error('Invalid username or password');
    }

    const data: LoginResponse = await res.json();
    setUser(toUser(data, data.accessToken));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    resetSessionTimer(data.accessToken);
    return data.role;
  };

  const register = async (username: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, passwordHash: password }),
    });

    if (!res.ok) {
      throw new Error('Registration failed');
    }

    const data: LoginResponse = await res.json();
    setUser(toUser(data, data.accessToken));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    resetSessionTimer(data.accessToken);
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionSecondsLeft,
        isExtendingSession,
        login,
        register,
        logout,
        setSessionFromProfile,
        clearSession,
        extendSession,
        requireLoginAndRedirect,
        endSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
