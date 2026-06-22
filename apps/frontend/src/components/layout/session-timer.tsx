'use client';

import { Clock, RefreshCw } from 'lucide-react';
import { formatSessionCountdown } from '@/commons/auth/access-token';
import { useAuth } from '@/commons/providers/auth-context/auth-context';
import styles from './session-timer.module.css';

interface SessionTimerProps {
  isSidebarOpen?: boolean;
  variant?: 'sidebar' | 'header';
}

export function SessionTimer({ isSidebarOpen = true, variant = 'sidebar' }: SessionTimerProps) {
  const { user, sessionSecondsLeft, extendSession, isExtendingSession } = useAuth();

  if (!user || sessionSecondsLeft === null) {
    return null;
  }

  const countdown = formatSessionCountdown(sessionSecondsLeft);
  const isCritical = sessionSecondsLeft <= 5 * 60;
  const rootClass =
    variant === 'header' ? styles.headerTimer : styles.sessionTimer;

  if (variant === 'sidebar' && !isSidebarOpen) {
    return (
      <button
        type="button"
        className={styles.compactButton}
        onClick={() => void extendSession()}
        disabled={isExtendingSession}
        title={`세션 ${countdown} · 토큰 재발급`}
      >
        <Clock size={18} className={isCritical ? styles.iconCritical : undefined} />
      </button>
    );
  }

  return (
    <div className={rootClass}>
      <div className={styles.timerRow}>
        <Clock size={16} className={isCritical ? styles.iconCritical : undefined} />
        <span className={isCritical ? styles.timerCritical : styles.timerLabel}>
          {countdown}
        </span>
      </div>
      <button
        type="button"
        className={styles.refreshButton}
        onClick={() => void extendSession()}
        disabled={isExtendingSession}
      >
        <RefreshCw size={14} className={isExtendingSession ? styles.spinning : undefined} />
        <span>{isExtendingSession ? '재발급 중…' : '토큰 재발급'}</span>
      </button>
    </div>
  );
}
