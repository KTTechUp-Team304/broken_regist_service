import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty({ example: 101 })
  id!: number;

  @ApiProperty({ example: 'CS101' })
  code!: string;

  @ApiProperty({ example: '컴퓨터과학개론' })
  courseTitle!: string;

  @ApiProperty({ example: '기초 컴퓨터 과학 개론' })
  description!: string;

  @ApiProperty({ example: 5 })
  professorId!: number;

  @ApiProperty({ example: '리누스 토발즈' })
  professorName!: string | null;

  @ApiProperty({ example: 'engineering' })
  category!: string;

  @ApiProperty({ example: '월, 수 10:00-12:00', required: false })
  lectureTime?: string | null;

  @ApiProperty({ example: '공학관 301호', required: false })
  classroom?: string | null;

  @ApiProperty({ example: 3, required: false })
  credits?: number | null;

  @ApiProperty({ example: 30 })
  maxCapacity!: number;

  @ApiProperty({ example: 25 })
  currentCount!: number;

  @ApiProperty({ example: true })
  isVisible!: boolean;

  @ApiProperty({ example: '2026-04-01T09:00:00.000Z' })
  createdAt!: string;
}
