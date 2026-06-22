'use client';

import { useEffect, useRef, useState } from 'react';
import { Toast } from '@/components/ui/toast';
import type { FlagItem } from '@/commons/api/flags-api';

async function fetchCapturedFlagValues(): Promise<Set<string>> {
  try {
    const res = await fetch('/api/flags');
    if (!res.ok) return new Set();
    const data = (await res.json()) as FlagItem[];
    return new Set(
      data
        .filter((f) => f.captured && f.flagValue != null)
        .map((f) => f.flagValue as string),
    );
  } catch {
    return new Set();
  }
}

/**
 * 모든 fetch 응답을 감시:
 *  - _debug_trace.flag 발견 시 DB 기준으로 이미 등록된 flag인지 확인
 *  - 미등록 flag만 토스트 표시
 *  - /api/flags/submit 성공 시 captured 목록을 서버에서 재동기화
 */
export function FlagInterceptor() {
  const [toast, setToast] = useState<{ flag: string; key: number } | null>(null);
  const capturedRef = useRef<Set<string>>(new Set());

  // 마운트 시 DB에서 이미 등록된 flag 목록 로드
  useEffect(() => {
    fetchCapturedFlagValues().then((set) => {
      capturedRef.current = set;
    });
  }, []);

  useEffect(() => {
    const original = window.fetch;

    window.fetch = async (...args) => {
      const [input] = args;
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.toString() : ((input as Request).url ?? '');

      const res = await original(...args);

      res
        .clone()
        .json()
        .then(async (data) => {
          // flag 제출 성공 → DB 재동기화
          if (url.includes('/api/flags/submit') && data?.success) {
            capturedRef.current = await fetchCapturedFlagValues();
            return;
          }

          // 취약점 API 응답에서 flag 감지 → DB 기준으로 미등록 시만 토스트
          const flag = data?._debug_trace?.flag as string | undefined;
          if (flag && !capturedRef.current.has(flag)) {
            setToast({ flag, key: Date.now() });
          }
        })
        .catch(() => {});

      return res;
    };

    return () => {
      window.fetch = original;
    };
  }, []);

  if (!toast) return null;

  return (
    <Toast key={toast.key} message="미등록 FLAG 발견!" sub={toast.flag} type="success" onClose={() => setToast(null)} />
  );
}
