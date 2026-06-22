'use client';

import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchCourses, formatCategoryLabel, resolveIsVisibleQuery } from '@/commons/api/courses-api';
import styles from './courses.module.css';

const CATEGORY_OPTIONS = [
  { value: '전체', label: '전체' },
  { value: 'engineering', label: '공학' },
] as const;

type CoursesProps = {
  isVisibleQuery?: string;
};

export function Courses({ isVisibleQuery }: CoursesProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('전체');
  const deferredSearch = useDeferredValue(search.trim());

  const categoryParam = category === '전체' ? undefined : category;
  const isVisibleParam = resolveIsVisibleQuery(isVisibleQuery);

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['courses', { keyword: deferredSearch, category: categoryParam, isVisible: isVisibleParam }],
    queryFn: () =>
      fetchCourses({
        keyword: deferredSearch || undefined,
        category: categoryParam,
        isVisible: isVisibleParam,
      }),
  });

  const detailQuery = isVisibleParam ? `?isVisible=${encodeURIComponent(isVisibleParam)}` : '';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>강의 목록</h1>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="강의명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className={styles.select}>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className={styles.statusMessage}>강의 목록을 불러오는 중...</p>}
      {isError && <p className={styles.statusMessage}>강의 목록을 불러오지 못했습니다.</p>}

      <div className={styles.courseList}>
        {!isLoading && !isError && courses.length === 0 && (
          <p className={styles.statusMessage}>조건에 맞는 강의가 없습니다.</p>
        )}
        {courses.map((course) => (
          <Link key={course.id} href={`/course/${course.id}${detailQuery}`} className={styles.courseCard}>
            <div>
              <div className={styles.courseHeader}>
                <h3 className={styles.courseTitle}>{course.courseTitle}</h3>
                {!course.isVisible && <span className={styles.hiddenBadge}>숨김</span>}
              </div>
              <p className={styles.professor}>{course.professorName ?? '-'}</p>
            </div>
            <div className={styles.courseFooter}>
              <span className={styles.category}>{formatCategoryLabel(course.category)}</span>
              <span className={styles.capacity}>
                {course.currentCount}/{course.maxCapacity}명
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
