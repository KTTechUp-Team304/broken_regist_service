import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CourseFilesParamDto } from './dto/course-files-param.dto';
import { FileIdParamDto } from './dto/file-id-param.dto';
import { FileResponseDto } from './dto/file-response.dto';

@ApiTags('Files')
@Controller('courses/:courseId/files')
export class CourseFilesController {
  constructor(private readonly svc: FilesService) {}

  @Get()
  @ApiOperation({
    summary: '강의 자료 목록 조회 (SQL Injection, 내부 경로 노출)',
  })
  @ApiResponse({ status: 200, type: [FileResponseDto] })
  async list(@Param() params: CourseFilesParamDto): Promise<any[]> {
    return this.svc.findByCourse(params.courseId);
  }
}

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly svc: FilesService) {}

  @Get(':fileId/download')
  @ApiOperation({ summary: '파일 다운로드 (IDOR, 내부 경로 노출)' })
  @ApiResponse({ status: 200, type: FileResponseDto })
  async download(@Param() params: FileIdParamDto): Promise<any> {
    return this.svc.findOne(params.fileId);
  }

  @Post(':fileId/delete')
  @ApiOperation({ summary: '파일 삭제 (권한 검사 누락)' })
  @ApiResponse({ status: 200, type: FileResponseDto })
  async remove(@Param() params: FileIdParamDto): Promise<any> {
    return this.svc.delete(params.fileId);
  }
}
