import { authFetch } from './auth-fetch';

export interface MeResponse {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

export interface EnrollmentResponse {
  id: number;
  userId: number;
  courseId: number;
  status: string;
  enrolledAt: string;
  droppedAt?: string | null;
  courseTitle?: string | null;
  professorName?: string | null;
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

export function fetchMe() {
  return authFetch('/api/auth/me').then((res) => parseJson<MeResponse>(res, '계정 정보를 불러오지 못했습니다.'));
}

export function fetchMyEnrollments(userId?: number) {
  const query = userId != null ? `?userId=${userId}` : '';
  return authFetch(`/api/enrollments/me${query}`).then((res) =>
    parseJson<EnrollmentResponse[]>(res, '수강 목록을 불러오지 못했습니다.'),
  );
}

export function createEnrollment(userId: number, courseId: number) {
  return authFetch('/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, courseId, status: 'enrolled' }),
  }).then((res) => parseJson<EnrollmentResponse>(res, '수강신청에 실패했습니다.'));
}

export function cancelEnrollment(enrollmentId: number) {
  return authFetch(`/api/enrollments/${enrollmentId}/cancel`, { method: 'POST' }).then((res) =>
    parseJson<EnrollmentResponse>(res, '수강 취소에 실패했습니다.'),
  );
}
