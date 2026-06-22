'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './toast.module.css';

export interface ToastProps {
  message: string;
  sub?: string;
  type?: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  sub,
  type = 'success',
  duration = 15000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = () => {
    clearTimeout(hideTimerRef.current);
    setVisible(false);
    setTimeout(() => onCloseRef.current(), 300);
  };

  useEffect(() => {
    const showRaf = requestAnimationFrame(() => setVisible(true));

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onCloseRef.current(), 300);
    }, duration);

    return () => {
      cancelAnimationFrame(showRaf);
      clearTimeout(hideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${visible ? styles.visible : ''}`}
    >
      <span className={styles.icon}>{type === 'success' ? '🚩' : '✕'}</span>
      <div className={styles.body}>
        <span className={styles.message}>{message}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={dismiss}
        aria-label="닫기"
      >
        ✕
      </button>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={
            { '--toast-duration': `${duration}ms` } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
