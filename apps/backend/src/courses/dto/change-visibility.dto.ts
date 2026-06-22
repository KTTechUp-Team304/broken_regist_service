import { ApiProperty } from '@nestjs/swagger';

/**
 * POST /api/courses/:courseId/visibility
 * - 권한 검사 없음, SQL Injection 노출
 */
export class ChangeVisibilityDto {
  @ApiProperty({
    description: '공개(true)/숨김(false) 설정 (검증 없이 SQL 문에 삽입됨)',
    example: true,
  })
  isVisible!: boolean;
}
