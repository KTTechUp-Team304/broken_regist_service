import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

const COURSE_SELECT = `
  c.id,
  c.code,
  c.name AS "courseTitle",
  c.description,
  c.professor_id AS "professorId",
  p.name AS "professorName",
  c.category,
  c.lecture_time AS "lectureTime",
  c.classroom,
  c.credits,
  c.max_capacity AS "maxCapacity",
  c.current_count AS "currentCount",
  c.is_visible AS "isVisible",
  c.created_at AS "createdAt"
`;

const COURSE_FROM_JOIN = `
  FROM courses c
  LEFT JOIN professors p ON p.id = c.professor_id
`;

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {}

  /**
   * GET /api/courses
   * - 기본: 공개 강의만 (`is_visible = true`)
   * - `isVisible` 쿼리 전달 시 필터 우회 가능 (실습용)
   * - raw SQL + 파라미터 검증 없음 → SQL Injection
   */
  async findAll(query: {
    keyword?: string;
    category?: string;
    isVisible?: string;
  }): Promise<any[]> {
    let whereClause = '1=1';
    if (query.isVisible !== undefined) {
      whereClause += ` AND c.is_visible = ${query.isVisible}`;
    } else {
      whereClause += ` AND c.is_visible = true`;
    }
    if (query.keyword !== undefined) {
      whereClause += ` AND (c.name LIKE '%${query.keyword}%' OR c.code LIKE '%${query.keyword}%' OR c.description LIKE '%${query.keyword}%')`;
    }
    if (query.category !== undefined) {
      whereClause += ` AND c.category = '${query.category}'`;
    }
    const sql = `
      SELECT ${COURSE_SELECT}
      ${COURSE_FROM_JOIN}
      WHERE ${whereClause}
    `;
    return this.repo.query(sql);
  }

  /**
   * GET /api/courses/:courseId
   * - 기본: 공개 강의만
   * - `isVisible=false` 쿼리 시 숨김 강의도 조회 (실습용)
   * - 숨김 강의 접근 시 403 (존재는 하지만 권한 없음 힌트)
   */
  async findOne(
    courseId: string,
    query?: { isVisible?: string },
  ): Promise<any> {
    const includeHidden = query?.isVisible === 'false';
    const rows = await this.queryOneById(courseId);

    if (!rows.length) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const course = rows[0];
    if (!course.isVisible && !includeHidden) {
      throw new ForbiddenException(
        'You do not have permission to access this course',
      );
    }

    return course;
  }

  private queryOneById(courseId: string): Promise<any[]> {
    const sql = `
      SELECT ${COURSE_SELECT}
      ${COURSE_FROM_JOIN}
      WHERE c.id = ${courseId}
    `;
    return this.repo.query(sql);
  }

  /**
   * POST /api/courses/:courseId/visibility
   * - 권한 검증 없음 → 모든 사용자가 호출 가능
   * - 파라미터 검증 없음 → SQL Injection
   */
  async changeVisibility(courseId: string, isVisible: boolean): Promise<any> {
    await this.repo.query(`
      UPDATE courses
      SET is_visible = ${isVisible}
      WHERE id = ${courseId}
    `);
    return this.findOne(courseId, { isVisible: 'false' });
  }
}
