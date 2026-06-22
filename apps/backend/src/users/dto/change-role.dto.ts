import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

/**
 * Body DTO for role 변경
 * - role 필드 검증 없이 SQL 문에 그대로 사용됨
 */
export class ChangeRoleDto {
  @ApiProperty({
    description:
      '변경할 role (검증 없이 SQL 문에 삽입되어 권한 상승 및 Injection 가능)',
    example: UserRole.ADMIN,
    enum: Object.values(UserRole),
  })
  role!: string;
}
