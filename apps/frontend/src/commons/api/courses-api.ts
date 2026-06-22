import { authFetch } from './auth-fetch';

export interface CourseResponse {
  id: number;
  code: string;
  courseTitle: string;
  description: string | null;
  professorId: number;
  professorName: string | null;
  category: string | null;
  lectureTime: string | null;
  classroom: string | null;
  credits: number | null;
  maxCapacity: number;
  currentCount: number;
  isVisible: boolean;
  createdAt: string;
}

export interface CourseFileResponse {
  id: number;
  courseId: number;
  uploaderId: number;
  originalName: string;
  storedPath: string;
  mimeType: string;
  fileSize: number;
  isPublic: boolean;
  uploadedAt: string;
}

export interface FetchCoursesParams {
  keyword?: string;
  category?: string;
  isVisible?: string;
}

/** URL 쿼리 isVisible / isvisible (대소문자 혼용) */
export function resolveIsVisibleQuery(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
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

function buildCoursesQuery(params: FetchCoursesParams): string {
  const search = new URLSearchParams();
  if (params.keyword) {
    search.set('keyword', params.keyword);
  }
  if (params.category) {
    search.set('category', params.category);
  }
  if (params.isVisible) {
    search.set('isVisible', params.isVisible);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function fetchCourses(params: FetchCoursesParams = {}) {
  return authFetch(`/api/courses${buildCoursesQuery(params)}`).then((res) =>
    parseJson<CourseResponse[]>(res, '강의 목록을 불러오지 못했습니다.'),
  );
}

export function fetchCourse(courseId: number, params?: Pick<FetchCoursesParams, 'isVisible'>) {
  const query = buildCoursesQuery({ isVisible: params?.isVisible });
  return authFetch(`/api/courses/${courseId}${query}`).then((res) =>
    parseJson<CourseResponse>(res, '강의 정보를 불러오지 못했습니다.'),
  );
}

export function fetchCourseFiles(courseId: number) {
  return authFetch(`/api/courses/${courseId}/files`).then((res) =>
    parseJson<CourseFileResponse[]>(res, '강의 자료를 불러오지 못했습니다.'),
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCategoryLabel(category: string | null | undefined): string {
  if (!category) {
    return '-';
  }
  if (category === 'engineering') {
    return '공학';
  }
  return category;
}

export function formatDateOnly(isoDate: string | undefined | null): string {
  if (!isoDate) {
    return '';
  }
  return isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
}
