import Link from 'next/link';
import styles from './admin-course-edit.module.css';

interface AdminCourseEditProps {
  courseId: string;
}

export function AdminCourseEdit({ courseId }: AdminCourseEditProps) {
  return (
    <div className={styles.wrap}>
      <p className={styles.lead}>강의 수정 (ID: {courseId})</p>
      <Link href="/admin/courses" className={styles.back}>
        ← 강의 목록으로
      </Link>
    </div>
  );
}
