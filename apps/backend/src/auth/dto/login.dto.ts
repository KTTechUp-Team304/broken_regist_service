import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'student01',
    description: '검증 없이 SQL WHERE 절에 삽입됨 (SQL Injection 가능)',
  })
  username!: string;

  @ApiProperty({
    example: 'plain-password-input',
    description:
      '원문 비밀번호 입력값. SHA-256 후 SQL WHERE 절에 삽입됨 (SQL Injection 가능)',
  })
  passwordHash!: string;
}
