'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchAdminCourses } from '@/commons/api/admin-api';
import styles from './admin-courses.module.css';

export function AdminCourses() {
  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: fetchAdminCourses,
  });

  const handleToggleVisibility = (courseId: number) => {
    alert(`강의 ${courseId} 공개 상태 변경`);
  };

  const handleDelete = (courseId: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      alert(`강의 ${courseId} 삭제됨`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>강의 관리</h1>
        <button type="button" className={styles.createButton}>
          강의 생성
        </button>
      </div>

      {isLoading && <p>강의 목록을 불러오는 중...</p>}
      {isError && <p>강의 목록을 불러오지 못했습니다.</p>}

      <div className={styles.courseTable}>
        <div className={styles.tableHeader}>
          <span className={styles.headerCell}>강의명</span>
          <span className={styles.headerCell}>교수</span>
          <span className={styles.headerCell}>수강인원</span>
          <span className={styles.headerCell}>상태</span>
          <span className={styles.headerCell}>작업</span>
        </div>

        {!isLoading &&
          !isError &&
          courses.map((response) => {
            const course = {
              id: response.id,
              courseTitle: response.courseTitle,
              professorName: response.professorName,
              category: response.category,
              isVisible: response.isVisible,
              currentCount: response.currentCount,
              maxCapacity: response.maxCapacity,
              createdAt: response.createdAt,
            };

            return (
              <div key={course.id} className={styles.courseRow}>
                <span className={styles.courseTitle}>{course.courseTitle}</span>
                <span className={styles.courseInfo}>{course.professorName ?? '-'}</span>
                <span className={styles.courseInfo}>
                  {course.currentCount}/{course.maxCapacity}
                </span>
                <span className={styles.courseInfo}>
                  {course.isVisible ? (
                    <span className={styles.publicBadge}>공개</span>
                  ) : (
                    <span className={styles.hiddenBadge}>숨김</span>
                  )}
                </span>
                <div className={styles.actions}>
                  <Link href={`/admin/courses/${course.id}`} className={styles.actionButton}>
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(course.id)}
                    className={styles.actionButton}
                  >
                    {course.isVisible ? '숨김' : '공개'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(course.id)}
                    className={styles.deleteButton}
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
