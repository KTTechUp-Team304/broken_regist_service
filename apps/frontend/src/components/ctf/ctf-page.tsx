'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchFlags, submitFlag } from '@/commons/api/flags-api';
import { Toast } from '@/components/ui/toast';
import styles from './ctf-page.module.css';

const DIFFICULTY_STARS: Record<number, string> = {
  1: '★☆☆',
  2: '★★☆',
  3: '★★★',
};

function CategoryBadge({ category }: { category: string }) {
  return <span className={`${styles.categoryBadge} ${styles[`cat-${category}`]}`}>{category}</span>;
}

function ChallengeCard({
  flag,
}: {
  flag: {
    id: number;
    name: string;
    category: string;
    description: string;
    hint: string;
    points: number;
    difficulty: number;
    captured: boolean;
    capturedAt?: string | null;
  };
}) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className={`${styles.challengeCard} ${flag.captured ? styles.captured : ''}`}>
      <div className={styles.challengeTop}>
        <CategoryBadge category={flag.category} />
        <span className={`${styles.challengeName} ${flag.captured ? styles.capturedName : ''}`}>{flag.name}</span>
        <span className={styles.difficulty}>{DIFFICULTY_STARS[flag.difficulty] ?? '★☆☆'}</span>
        <span className={`${styles.points} ${flag.captured ? styles.capturedPoints : ''}`}>{flag.points}pt</span>
        {flag.captured && <span className={styles.capturedBadge}>&#10003; 클리어</span>}
      </div>

      <p className={styles.challengeDesc}>{flag.description}</p>

      {!flag.captured && (
        <>
          <button type="button" className={styles.hintToggle} onClick={() => setShowHint((v) => !v)}>
            {showHint ? '힌트 숨기기 ▲' : '힌트 보기 ▼'}
          </button>
          {showHint && <div className={styles.hint}>{flag.hint}</div>}
        </>
      )}
    </div>
  );
}

export function CtfPage() {
  const queryClient = useQueryClient();
  const [flagInput, setFlagInput] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    sub?: string;
    type: 'success' | 'error';
    key: number;
  } | null>(null);

  const { data: flags = [] } = useQuery({
    queryKey: ['flags'],
    queryFn: fetchFlags,
  });

  const submitMutation = useMutation({
    mutationFn: (flag: string) => submitFlag(flag),
    onSuccess: (result) => {
      setFlagInput('');
      setToast({
        message: result.success ? `FLAG 획득! +${result.points}pt` : result.message,
        sub: result.success ? result.flagName : undefined,
        type: result.success ? 'success' : 'error',
        key: Date.now(),
      });
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['flags'] });
      }
    },
    onError: () => {
      setToast({ message: '제출 중 오류가 발생했습니다.', type: 'error', key: Date.now() });
    },
  });

  const handleSubmit = () => {
    if (!flagInput.trim()) return;
    submitMutation.mutate(flagInput.trim());
  };

  const captured = flags.filter((f) => f.captured).length;
  const total = flags.length;
  const points = flags.filter((f) => f.captured).reduce((sum, f) => sum + f.points, 0);
  const pct = total > 0 ? Math.round((captured / total) * 100) : 0;

  return (
    <div className={styles.container}>
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          sub={toast.sub}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 진행 현황 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>취약점 실습 (CTF)</h1>
            <p className={styles.subtitle}>API 응답에 숨겨진 FLAG 값을 찾아 제출하세요</p>
          </div>
          <div className={styles.scoreBox}>
            <div className={styles.scorePrimary}>{points}pt</div>
            <div className={styles.scoreSecondary}>
              {captured} / {total} 클리어
            </div>
          </div>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* FLAG 제출 */}
      <div className={styles.submitSection}>
        <span className={styles.submitLabel}>FLAG 제출</span>
        <input
          className={styles.submitInput}
          type="text"
          placeholder="FLAG{...}"
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={submitMutation.isPending || !flagInput.trim()}
        >
          제출
        </button>
      </div>

      {/* 챌린지 목록 */}
      <p className={styles.sectionTitle}>챌린지 목록</p>
      <div className={styles.challengeGrid}>
        {flags.map((flag) => (
          <ChallengeCard key={flag.id} flag={flag} />
        ))}
      </div>
    </div>
  );
}
