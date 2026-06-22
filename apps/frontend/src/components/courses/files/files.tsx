'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseFiles, formatDateOnly, formatFileSize } from '@/commons/api/courses-api';
import { authFetch } from '@/commons/api/auth-fetch';
import styles from './files.module.css';

export function CourseFiles() {
  const params = useParams();
  const courseId = Number(params.courseId);

  const {
    data: files = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['courses', courseId, 'files'],
    queryFn: () => fetchCourseFiles(courseId),
    enabled: Number.isFinite(courseId),
  });

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const res = await authFetch(`/api/files/${fileId}/download`);
      if (!res.ok) {
        throw new Error('다운로드에 실패했습니다.');
      }
      await res.json();
      alert(`${fileName} 다운로드 시작`);
    } catch {
      alert('다운로드에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>강의 자료</h1>
      </div>

      {isLoading && <p className={styles.statusMessage}>강의 자료를 불러오는 중...</p>}
      {isError && <p className={styles.statusMessage}>강의 자료를 불러오지 못했습니다.</p>}

      <div className={styles.fileList}>
        <div className={styles.tableHeader}>
          <span className={styles.headerCell}>파일명</span>
          <span className={styles.headerCell}>업로더</span>
          <span className={styles.headerCell}>업로드일</span>
          <span className={styles.headerCell}>크기</span>
          <span className={styles.headerCell}>작업</span>
        </div>

        {!isLoading && !isError && files.length === 0 && (
          <p className={styles.statusMessage}>등록된 강의 자료가 없습니다.</p>
        )}

        {files.map((file) => (
          <div key={file.id} className={styles.fileRow}>
            <span className={styles.fileName}>{file.originalName}</span>
            <span className={styles.fileInfo}>사용자 #{file.uploaderId}</span>
            <span className={styles.fileInfo}>{formatDateOnly(file.uploadedAt)}</span>
            <span className={styles.fileInfo}>{formatFileSize(file.fileSize)}</span>
            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => handleDownload(file.id, file.originalName)}
                className={styles.downloadButton}
              >
                다운로드
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
