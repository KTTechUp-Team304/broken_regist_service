import { ApiProperty } from '@nestjs/swagger';

/**
 * Path parameter DTO
 * - userId에 대한 별도 검증이 없으며, 그대로 raw SQL에 주입됨
 */
export class GetUserParamDto {
  @ApiProperty({
    description:
      '조회할 사용자 ID (검증 없이 SQL 문에 삽입되어 SQL Injection 가능)',
    example: '1 OR 1=1',
  })
  userId!: string;
}
