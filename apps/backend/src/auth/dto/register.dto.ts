import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiPropertyOptional({
    example: 1001,
    description: '문서 시나리오 상 취약 입력 확인용 id 필드',
  })
  id?: number;

  @ApiProperty({ example: 'new-student' })
  username!: string;

  @ApiProperty({
    example: 'plain-password-input',
    description:
      'MVP 문서 기준으로 원문 비밀번호 입력 필드명은 passwordHash를 사용',
  })
  passwordHash!: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: '취약점 시나리오 확인용 role 직접 전달 필드',
  })
  role?: UserRole;
}
