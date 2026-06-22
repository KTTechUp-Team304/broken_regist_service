import { ApiProperty } from '@nestjs/swagger';

/**
 * 파일 메타데이터 응답 스키마
 * - storedPath 포함 → 내부 경로 노출
 */
export class FileResponseDto {
  @ApiProperty({ example: 1001, description: '파일 고유 ID' })
  id!: number;

  @ApiProperty({ example: 101, description: '관련 강의 ID' })
  courseId!: number;

  @ApiProperty({ example: 1, description: '업로더(사용자) ID' })
  uploaderId!: number;

  @ApiProperty({ example: 'lecture1.pdf', description: '원본 파일명' })
  originalName!: string;

  @ApiProperty({
    example: '/var/www/uploads/lecture1.pdf',
    description: '서버 내부 저장 경로(민감 정보 노출)',
  })
  storedPath!: string;

  @ApiProperty({ example: 'application/pdf', description: 'MIME Type' })
  mimeType!: string;

  @ApiProperty({ example: 234567, description: '파일 크기(bytes)' })
  fileSize!: number;

  @ApiProperty({ example: false, description: '공개 파일 여부' })
  isPublic!: boolean;

  @ApiProperty({
    example: '2026-04-01T10:00:00Z',
    description: '업로드 일시',
  })
  uploadedAt!: string;
}
