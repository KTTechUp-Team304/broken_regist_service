'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { cancelEnrollment, fetchMe, fetchMyEnrollments } from '@/commons/api/auth-api';
import { useAuth } from '@/commons/providers/auth-context/auth-context';
import styles from './dashboard.module.css';

function formatStudentId(apiId: number): string {
  const suffix = String(apiId).padStart(2, '0');
  return `26101${suffix}`;
}

function formatDateOnly(isoDate: string | undefined): string {
  if (!isoDate) return '';
  return isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
}

export function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: Boolean(user?.token),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'me', user?.id],
    queryFn: () => fetchMyEnrollments(user!.id),
    enabled: Boolean(user?.id),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
    },
  });

  const enrolledList = enrollments.filter((enrollment) => enrollment.status === 'enrolled');

  const handleCancel = (enrollmentId: number) => {
    if (!confirm('수강을 취소하시겠습니까?')) {
      return;
    }
    cancelMutation.mutate(enrollmentId, {
      onError: () => {
        alert('수강 취소에 실패했습니다.');
      },
    });
  };

  const displayUsername = profile?.username ?? user?.username;
  const displayStudentId = profile ? formatStudentId(profile.id) : user?.id;
  const displayRegisteredAt = formatDateOnly(profile?.createdAt ?? user?.registeredAt);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>마이페이지</h1>

      <div className={styles.profileSection}>
        <div className={styles.profilePhoto}>
          <div className={styles.photoPlaceholder}>
            <span className={styles.photoIcon}>👤</span>
          </div>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>학생 이름</span>
            <span className={styles.infoValue}>{displayUsername}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>학번</span>
            <span className={styles.infoValue}>{displayStudentId}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>전공</span>
            <span className={styles.infoValue}>컴퓨터공학</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>학년</span>
            <span className={styles.infoValue}>3학년</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>담당교수</span>
            <span className={styles.infoValue}>리누스 토발즈</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>등록일자</span>
            <span className={styles.infoValue}>{displayRegisteredAt}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>수강중인 강의</span>
            <span className={styles.infoValue}>{enrolledList.length}개</span>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>수강 목록</h2>

      <div className={styles.enrollmentList}>
        {enrolledList.map((enrollment) => (
          <div key={enrollment.id} className={styles.enrollmentCard}>
            <div className={styles.enrollmentInfo}>
              <h3 className={styles.courseTitle}>{enrollment.courseTitle}</h3>
              <p className={styles.professor}>{enrollment.professorName}</p>
              <p className={styles.date}>신청일: {formatDateOnly(enrollment.enrolledAt)}</p>
            </div>

            <div className={styles.actions}>
              <Link href={`/course/${enrollment.courseId}`} className={styles.detailButton}>
                상세보기
              </Link>
              <button
                type="button"
                onClick={() => handleCancel(enrollment.id)}
                className={styles.cancelButton}
                disabled={cancelMutation.isPending}
              >
                수강취소
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
