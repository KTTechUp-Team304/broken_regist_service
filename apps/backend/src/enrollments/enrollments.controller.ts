import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { GetMyEnrollmentsQueryDto } from './dto/get-my-enrollments-query.dto';
import { EnrollmentParamDto } from './dto/enrollment-param.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentResponseDto } from './dto/enrollment-response.dto';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly svc: EnrollmentsService) {}

  @Get('me')
  @ApiOperation({ summary: '내 수강신청 목록 조회' })
  @ApiResponse({ status: 200, type: [EnrollmentResponseDto] })
  async getMy(@Query() query: GetMyEnrollmentsQueryDto): Promise<any[]> {
    return this.svc.findMy(query);
  }

  @Get(':enrollmentId')
  @ApiOperation({ summary: '수강신청 상세 조회' })
  @ApiResponse({ status: 200, type: EnrollmentResponseDto })
  async getOne(@Param() params: EnrollmentParamDto): Promise<any> {
    return this.svc.findOne(params.enrollmentId);
  }

  @Post()
  @ApiOperation({ summary: '수강신청 생성' })
  @ApiResponse({ status: 201, type: EnrollmentResponseDto })
  async create(@Body() dto: CreateEnrollmentDto): Promise<any> {
    return this.svc.create(dto);
  }

  @Post(':enrollmentId/cancel')
  @ApiOperation({ summary: '수강신청 취소' })
  @ApiResponse({ status: 200, type: EnrollmentResponseDto })
  async cancel(@Param() params: EnrollmentParamDto): Promise<any> {
    return this.svc.cancel(params.enrollmentId);
  }
}
