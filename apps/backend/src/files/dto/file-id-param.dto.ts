import { ApiProperty } from '@nestjs/swagger';

/**
 * GET/POST /api/files/:fileId/*
 * - 검증 없이 그대로 SQL WHERE 절에 삽입됨
 */
export class FileIdParamDto {
  @ApiProperty({
    description: '파일 ID (검증 없이 SQL 문에 주입됨)',
    example: '1001',
  })
  fileId!: string;
}
