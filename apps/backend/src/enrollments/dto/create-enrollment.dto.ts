import { ApiProperty } from '@nestjs/swagger';

/**
 * POST /api/enrollments 바디 DTO
 * - userId, courseId, status 필드 검증 없이 SQL에 주입됨
 */
export class CreateEnrollmentDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  userId!: number;

  @ApiProperty({ description: '강의 ID', example: 101 })
  courseId!: number;

  @ApiProperty({
    description: '상태 (기본: enrolled)',
    example: 'enrolled',
    required: false,
  })
  status?: string;
}
