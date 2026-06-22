import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * GET /api/courses
 * - SQL Injection, 숨김 강의 노출
 */
export class QueryCoursesDto {
  @ApiPropertyOptional({
    description: '검색어 (name/code/description 컬럼에 그대로 삽입됨)',
    example: "OR '1'='1",
  })
  keyword?: string;

  @ApiPropertyOptional({
    description: '카테고리 필터 (검증 없이 SQL에 사용됨)',
    example: 'math',
  })
  category?: string;

  @ApiPropertyOptional({
    description: 'isVisible 필터. 생략 시 true(공개만). false 입력 시 숨김 강의도 조회 가능',
    example: 'false',
  })
  isVisible?: string;
}
