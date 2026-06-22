/** 관리자 영역 공통 유틸 */

export function formatDateOnly(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '-';
  }
  return isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
}
