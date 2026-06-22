import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GetUserParamDto } from './dto/get-user-param.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  /**
   * GET /api/users/:userId
   * - 파라미터 검증 없이 SQL에 주입 → IDOR, SQL Injection 취약
   * - passwordHash 노출
   */
  @Get(':userId')
  @ApiOperation({ summary: '사용자 상세 조회' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getOne(@Param() params: GetUserParamDto): Promise<any> {
    return this.svc.findById(params.userId);
  }
}

@ApiTags('Admin Users')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly svc: UsersService) {}

  /**
   * GET /api/admin/users
   * - 관리자 인증/권한 검증이 없음
   * - passwordHash 포함 반환
   */
  @Get()
  @ApiOperation({ summary: '전체 사용자 목록 조회' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async listAll(): Promise<any[]> {
    return this.svc.findAll();
  }

  /**
   * POST /api/admin/users/:userId/role
   * - role 값 검증 없이 SQL에 주입 → 권한 상승, SQL Injection 노출
   */
  @Post(':userId/role')
  @ApiOperation({ summary: '사용자 role 변경' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async changeUserRole(
    @Param() params: GetUserParamDto,
    @Body() dto: ChangeRoleDto,
  ): Promise<any> {
    return this.svc.changeRole(params.userId, dto.role);
  }
}
