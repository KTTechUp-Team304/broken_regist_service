'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelEnrollment,
  createEnrollment,
  fetchMyEnrollments,
} from '@/commons/api/auth-api';
import {
  fetchCourse,
  formatCategoryLabel,
  resolveIsVisibleQuery,
} from '@/commons/api/courses-api';
import { hasStoredAccessToken } from '@/commons/api/auth-fetch';
import { useAuth } from '@/commons/providers/auth-context/auth-context';
import styles from './detail.module.css';

type CourseDetailProps = {
  courseId: number;
  isVisibleQuery?: string;
};

export function CourseDetail({ courseId, isVisibleQuery }: CourseDetailProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isVisibleParam = resolveIsVisibleQuery(isVisibleQuery);

  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['courses', courseId, { isVisible: isVisibleParam }],
    queryFn: () => fetchCourse(courseId, { isVisible: isVisibleParam }),
    enabled: Number.isFinite(courseId),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'me', user?.id],
    queryFn: () => fetchMyEnrollments(user!.id),
    enabled: Boolean(user?.id),
  });

  const enrollMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다.');
      }
      return createEnrollment(user.id, courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
      alert('수강신청이 완료되었습니다.');
    },
    onError: (error: Error) => {
      alert(error.message || '수강신청에 실패했습니다.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
      alert('수강이 취소되었습니다.');
    },
    onError: (error: Error) => {
      alert(error.message || '수강 취소에 실패했습니다.');
    },
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>강의 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !course) {
    const message =
      error instanceof Error &&
      error.message.includes('permission to access this course')
        ? '이 강의를 조회할 권한이 없습니다.'
        : '강의를 찾을 수 없습니다.';

    return (
      <div className={styles.container}>
        <p>{message}</p>
      </div>
    );
  }

  const isFull = Number(course.currentCount) >= Number(course.maxCapacity);
  const currentEnrollment = enrollments.find(
    (enrollment) =>
      Number(enrollment.courseId) === courseId && enrollment.status === 'enrolled',
  );
  const isEnrolled = Boolean(currentEnrollment);
  const isAuthResolving = !user && hasStoredAccessToken();

  const enrollDisabled =
    isAuthResolving || Boolean(user && (isFull || isEnrolled || enrollMutation.isPending));

  const enrollLabel = (() => {
    if (isAuthResolving) return '확인 중...';
    if (!user) return '로그인 후 수강신청';
    if (isEnrolled) return '수강 중';
    if (isFull) return '정원 마감';
    if (enrollMutation.isPending) return '신청 중...';
    return '수강신청';
  })();

  const handleEnroll = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (isEnrolled) {
      return;
    }
    if (isFull) {
      alert('정원이 마감되었습니다.');
      return;
    }
    if (!confirm(`${course.courseTitle} 강의를 수강신청하시겠습니까?`)) {
      return;
    }
    enrollMutation.mutate();
  };

  const handleCancel = () => {
    if (!currentEnrollment) {
      return;
    }
    if (!confirm(`${course.courseTitle} 수강을 취소하시겠습니까?`)) {
      return;
    }
    cancelMutation.mutate(currentEnrollment.id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{course.courseTitle}</h1>
        <div className={styles.badges}>
          {!course.isVisible && (
            <span className={`${styles.badge} ${styles.hiddenBadge}`}>숨김</span>
          )}
          <span className={`${styles.badge} ${styles.category}`}>
            {formatCategoryLabel(course.category)}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.label}>강의코드</span>
            <span className={styles.value}>{course.code}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>교수</span>
            <span className={styles.value}>{course.professorName ?? '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>강의시간</span>
            <span className={styles.value}>{course.lectureTime ?? '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>강의실</span>
            <span className={styles.value}>{course.classroom ?? '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>학점</span>
            <span className={styles.value}>
              {course.credits != null ? `${course.credits}학점` : '-'}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>수강인원</span>
            <span className={styles.value}>
              {course.currentCount}/{course.maxCapacity}명
            </span>
          </div>
        </div>

        <div className={styles.description}>
          <h3 className={styles.sectionTitle}>강의 설명</h3>
          <p>{course.description ?? '-'}</p>
        </div>

        <div className={styles.actions}>
          {isEnrolled ? (
            <>
              <button type="button" className={styles.enrolledButton} disabled>
                수강 중
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? '취소 중...' : '수강취소'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEnroll}
              className={styles.enrollButton}
              disabled={enrollDisabled}
            >
              {enrollLabel}
            </button>
          )}
          <Link href={`/course/${courseId}/files`} className={styles.filesButton}>
            강의 자료
          </Link>
        </div>
      </div>
    </div>
  );
}
