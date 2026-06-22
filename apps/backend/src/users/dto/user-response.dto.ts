import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';

/**
 * 사용자 응답 스키마
 * - passwordHash가 포함되어 민감 정보가 노출됨
 */
export class UserResponseDto {
  @ApiProperty({ example: 42, description: '사용자 고유 ID' })
  id!: number;

  @ApiProperty({ example: 'student01', description: '사용자 이름' })
  username!: string;

  @ApiProperty({
    example: UserRole.STUDENT,
    enum: Object.values(UserRole),
    description: '사용자 역할',
  })
  role!: UserRole;

  @ApiProperty({
    example: '2026-04-01T09:00:00Z',
    description: '계정 생성 일시',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-05-13T14:30:00Z',
    description: '최근 로그인 일시 (미로그인 시 null)',
    nullable: true,
  })
  recentLoginDate!: string | null;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    enum: Object.values(UserStatus),
    description: '계정 상태',
  })
  status!: UserStatus;

  @ApiProperty({
    example: '$2b$10$abcdefghijklmnopqrstuvwx',
    description: 'passwordHash (민감 정보 노출)',
  })
  passwordHash!: string;
}
