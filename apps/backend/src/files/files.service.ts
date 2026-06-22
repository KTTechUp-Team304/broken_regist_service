import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileResource } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileResource)
    private readonly repo: Repository<FileResource>,
  ) {}

  /**
   * GET /api/courses/:courseId/files
   * - SQL Injection, 숨김 강의 bypass, 내부 경로 storedPath 노출
   */
  async findByCourse(courseId: string): Promise<any[]> {
    const sql = `
      SELECT
        id,
        course_id   AS "courseId",
        uploader_id AS "uploaderId",
        original_name AS "originalName",
        stored_path   AS "storedPath",
        mime_type    AS "mimeType",
        file_size    AS "fileSize",
        is_public    AS "isPublic",
        uploaded_at  AS "uploadedAt"
      FROM files
      WHERE course_id = ${courseId}
    `;
    return this.repo.query(sql);
  }

  /**
   * GET /api/files/:fileId/download
   * - IDOR, SQL Injection, internal path 노출
   */
  async findOne(fileId: string): Promise<any> {
    const sql = `
      SELECT
        id,
        course_id   AS "courseId",
        uploader_id AS "uploaderId",
        original_name AS "originalName",
        stored_path   AS "storedPath",
        mime_type    AS "mimeType",
        file_size    AS "fileSize",
        is_public    AS "isPublic",
        uploaded_at  AS "uploadedAt"
      FROM files
      WHERE id = ${fileId}
    `;
    const rows = await this.repo.query(sql);
    if (!rows.length) {
      throw new NotFoundException(`File ${fileId} not found`);
    }
    return rows[0];
  }

  /**
   * POST /api/files/:fileId/delete
   * - 권한 검사 없음, SQL Injection, 삭제 후 audit/event 로깅 없음
   */
  async delete(fileId: string): Promise<any> {
    // 삭제 전 메타데이터 조회
    const selectSql = `
      SELECT
        id,
        course_id     AS "courseId",
        uploader_id   AS "uploaderId",
        original_name AS "originalName"
      FROM files
      WHERE id = ${fileId}
    `;
    const rows = await this.repo.query(selectSql);

    // 실제 삭제
    const deleteSql = `DELETE FROM files WHERE id = ${fileId}`;
    await this.repo.query(deleteSql);

    if (!rows.length) {
      throw new NotFoundException(`File ${fileId} not found`);
    }
    return rows[0];
  }
}
