import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /api/admin
   * - 문서상 role: admin
   * - Bearer·role 검증 없음 → student/professor·무토큰도 호출 가능 (A01 Broken Access Control)
   */
  @Get()
  @ApiOperation({
    summary: '관리자 대시보드 통계 조회',
  })
  @ApiResponse({ status: 200, type: AdminDashboardResponseDto })
  getDashboard() {
    return this.adminService.getDashboard();
  }
}
