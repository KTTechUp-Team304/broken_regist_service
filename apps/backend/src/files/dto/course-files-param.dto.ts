import { ApiProperty } from '@nestjs/swagger';

/**
 * GET /api/courses/:courseId/files
 * - 검증 없이 그대로 SQL WHERE 절에 삽입되어 SQL Injection 가능
 */
export class CourseFilesParamDto {
  @ApiProperty({
    description: '강의 ID (검증 없이 SQL 문에 주입됨)',
    example: '101',
  })
  courseId!: string;
}
