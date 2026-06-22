'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeUserRole,
  fetchAdminUsers,
  type UserRole,
} from '@/commons/api/admin-api';
import { formatDateOnly } from '@/components/admin/admin';
import styles from './admin-users.module.css';

export function AdminUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
      changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const handleRoleChange = (userId: number, newRole: UserRole) => {
    roleMutation.mutate(
      { userId, role: newRole },
      {
        onSuccess: () => {
          alert(`사용자 권한이 ${newRole}로 변경되었습니다.`);
        },
        onError: () => {
          alert('사용자 권한 변경에 실패했습니다.');
        },
      },
    );
  };

  const mappedUsers = users.map((response) => ({
    id: response.id,
    username: response.username,
    role: response.role,
    createdAt: response.createdAt,
    lastLogin: response.recentLoginDate,
    status: response.status,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>사용자 관리</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>전체 사용자</span>
            <span className={styles.statValue}>{mappedUsers.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>활성 사용자</span>
            <span className={styles.statValue}>
              {mappedUsers.filter((u) => u.status === 'active').length}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>관리자</span>
            <span className={styles.statValue}>
              {mappedUsers.filter((u) => u.role === 'admin').length}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>교수</span>
            <span className={styles.statValue}>
              {mappedUsers.filter((u) => u.role === 'professor').length}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>학생</span>
            <span className={styles.statValue}>
              {mappedUsers.filter((u) => u.role === 'student').length}
            </span>
          </div>
        </div>
      </div>

      {isLoading && <p>사용자 목록을 불러오는 중...</p>}
      {isError && <p>사용자 목록을 불러오지 못했습니다.</p>}

      <div className={styles.userTable}>
        <div className={styles.tableHeader}>
          <span className={styles.headerCell}>ID</span>
          <span className={styles.headerCell}>사용자명</span>
          <span className={styles.headerCell}>전공</span>
          <span className={styles.headerCell}>권한</span>
          <span className={styles.headerCell}>등록일</span>
          <span className={styles.headerCell}>최근 로그인</span>
          <span className={styles.headerCell}>상태</span>
        </div>

        {!isLoading &&
          !isError &&
          mappedUsers.map((user) => (
            <div key={user.id} className={styles.userRow}>
              <span className={styles.userId}>{user.id}</span>
              <span className={styles.username}>{user.username}</span>
              <span className={styles.email}>{user.role === 'student' ? '컴퓨터공학' : '-'}</span>
              <div className={styles.roleCell}>
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as UserRole)
                  }
                  className={styles.roleSelect}
                  disabled={roleMutation.isPending}
                >
                  <option value="student">학생</option>
                  <option value="professor">교수</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              <span className={styles.date}>{formatDateOnly(user.createdAt)}</span>
              <span className={styles.date}>{formatDateOnly(user.lastLogin)}</span>
              <span className={styles.statusCell}>
                {user.status === 'active' ? (
                  <span className={styles.statusActive}>활성</span>
                ) : (
                  <span className={styles.statusSuspended}>정지</span>
                )}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
