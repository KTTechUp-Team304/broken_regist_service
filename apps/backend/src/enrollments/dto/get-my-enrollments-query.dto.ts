import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * GET /api/enrollments/me 쿼리 DTO
 * - userId를 포함하면 다른 사용자의 내역도 조회 가능
 */
export class GetMyEnrollmentsQueryDto {
  @ApiPropertyOptional({
    description: '조회 대상 사용자 ID',
    example: '2',
  })
  userId?: string;
}
