/** 백엔드 JWT_ACCESS_EXPIRES_IN 기본값(15m)과 동일 */
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

export function getAccessTokenExpiresAtMs(accessToken: string): number {
  try {
    const segment = accessToken.split('.')[1];
    if (!segment) {
      throw new Error('invalid token');
    }
    const payload = JSON.parse(
      atob(segment.replace(/-/g, '+').replace(/_/g, '/')),
    ) as { exp?: number };
    if (typeof payload.exp === 'number') {
      return payload.exp * 1000;
    }
  } catch {
    // JWT 파싱 실패 시 로그인 시점 기준 15분으로 폴백
  }
  return Date.now() + ACCESS_TOKEN_TTL_MS;
}

export function formatSessionCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
