import { ApiProperty } from '@nestjs/swagger';

/**
 * path param DTO
 * - 검증 없이 string 타입 그대로 SQL에 주입됨
 */
export class EnrollmentParamDto {
  @ApiProperty({
    description: '수강신청 ID',
    example: '201',
  })
  enrollmentId!: string;
}
