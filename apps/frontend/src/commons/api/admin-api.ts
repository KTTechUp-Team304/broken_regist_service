import { authFetch } from './auth-fetch';
import { fetchCourses, type CourseResponse } from './courses-api';

export type UserRole = 'student' | 'professor' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface DashboardStatItem {
  value: number;
  change: string;
}

export interface AdminDashboardResponse {
  stats: {
    totalUsers: DashboardStatItem;
    openedCourses: DashboardStatItem;
    totalEnrollments: DashboardStatItem;
    activeUsers: DashboardStatItem;
  };
  enrollmentTrend: { month: string; count: number }[];
  courseDistribution: { name: string; value: number }[];
  weeklyActiveUsers: { day: string; users: number }[];
}

export interface AdminUserResponse {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
  recentLoginDate: string | null;
  status: UserStatus;
}

async function parseJson<T>(res: Response, errorMessage: string): Promise<T> {
  if (!res.ok) {
    let message = errorMessage;
    try {
      const body = await res.json();
      if (typeof body?.message === 'string') {
        message = body.message;
      } else if (Array.isArray(body?.message)) {
        message = body.message.join(', ');
      }
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }
  return res.json();
}

export function fetchAdminDashboard() {
  return authFetch('/api/admin').then((res) =>
    parseJson<AdminDashboardResponse>(res, '관리자 대시보드 데이터를 불러오지 못했습니다.'),
  );
}

export function fetchAdminUsers() {
  return authFetch('/api/admin/users').then((res) =>
    parseJson<AdminUserResponse[]>(res, '사용자 목록을 불러오지 못했습니다.'),
  );
}

export function changeUserRole(userId: number, role: UserRole) {
  return authFetch(`/api/admin/users/${userId}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  }).then((res) => parseJson<AdminUserResponse>(res, '사용자 권한 변경에 실패했습니다.'));
}

/** 관리자용 강의 목록 — 공개·숨김 강의 모두 포함 */
export async function fetchAdminCourses(): Promise<CourseResponse[]> {
  const [visible, hidden] = await Promise.all([
    fetchCourses({ isVisible: 'true' }),
    fetchCourses({ isVisible: 'false' }),
  ]);
  const byId = new Map<number, CourseResponse>();
  for (const course of [...visible, ...hidden]) {
    byId.set(course.id, course);
  }
  return Array.from(byId.values());
}
