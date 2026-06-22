interface RefreshResponse {
  accessToken: string;
}

type AuthFetchHandlers = {
  onAccessTokenRefreshed?: (accessToken: string) => void;
};

let refreshPromise: Promise<string> | null = null;
let handlers: AuthFetchHandlers = {};

export function setAuthFetchHandlers(next: AuthFetchHandlers) {
  handlers = next;
}

async function requestRefreshToken(): Promise<string> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data: RefreshResponse = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  handlers.onAccessTokenRefreshed?.(data.accessToken);
  return data.accessToken;
}

/** 사이드바에서 사용자가 수동으로 호출하는 토큰 재발급 */
export function refreshAccessTokenManually(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export function hasStoredAccessToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return Boolean(localStorage.getItem('accessToken'));
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const accessToken = localStorage.getItem('accessToken');
  const headers = new Headers(init?.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: init?.credentials ?? 'same-origin',
  });
}
