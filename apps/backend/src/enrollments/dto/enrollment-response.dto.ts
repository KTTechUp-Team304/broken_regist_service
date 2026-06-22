import { ApiProperty } from '@nestjs/swagger';

/**
 * 수강신청 응답 스키마
 */
export class EnrollmentResponseDto {
  @ApiProperty({ example: 201 })
  id!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 101 })
  courseId!: number;

  @ApiProperty({ example: 'enrolled' })
  status!: string;

  @ApiProperty({ example: '2026-09-01T08:30:00Z' })
  enrolledAt!: string;

  @ApiProperty({ example: '2026-09-10T08:30:00Z', required: false })
  droppedAt?: string;

  @ApiProperty({
    example: '웹 프로그래밍',
    required: false,
    description: '과목명 (courses.name)',
  })
  courseTitle?: string | null;

  @ApiProperty({
    example: '김교수',
    required: false,
    description: '담당 교수 표시명 (courses → professors.name)',
  })
  professorName?: string | null;
}
