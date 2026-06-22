import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { ChangeVisibilityDto } from './dto/change-visibility.dto';
import { CourseResponseDto } from './dto/course-response.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly svc: CoursesService) {}

  @Get()
  @ApiOperation({ summary: '강의 목록 조회 (SQL Injection, 숨김 강의 노출)' })
  @ApiResponse({ status: 200, type: [CourseResponseDto] })
  async list(@Query() query: QueryCoursesDto): Promise<any[]> {
    return this.svc.findAll(query);
  }

  @Get(':courseId')
  @ApiOperation({ summary: '강의 상세 조회 (IDOR, 파라미터 예외)' })
  @ApiResponse({ status: 200, type: CourseResponseDto })
  async getOne(
    @Param('courseId') courseId: string,
    @Query() query: QueryCoursesDto,
  ): Promise<any> {
    return this.svc.findOne(courseId, query);
  }

  @Post(':courseId/visibility')
  @ApiOperation({
    summary: '강의 공개/숨김 상태 변경 (권한 없음, SQL Injection)',
  })
  @ApiResponse({ status: 200, type: CourseResponseDto })
  async changeVisibility(
    @Param('courseId') courseId: string,
    @Body() body: ChangeVisibilityDto,
  ): Promise<any> {
    return this.svc.changeVisibility(courseId, body.isVisible);
  }
}
