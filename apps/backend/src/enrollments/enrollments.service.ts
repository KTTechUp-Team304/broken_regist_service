import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CTF_FLAGS } from '../flags/ctf-flags.constants';
import { Enrollment } from './entities/enrollment.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly repo: Repository<Enrollment>,
  ) {}

  /**
   * 내 수강신청 목록 조회
   * - userId 쿼리 파라미터를 그대로 SQL에 사용
   * - SQL Injection, 권한 검사 없음, rate limit 없음
   */
  async findMy(query: { userId?: string }): Promise<any[]> {
    const cond = query.userId ? `e.user_id = ${query.userId}` : '1=1';
    const sql = `
      SELECT
        e.id,
        e.user_id    AS "userId",
        e.course_id  AS "courseId",
        e.status,
        e.enrolled_at AS "enrolledAt",
        e.dropped_at AS "droppedAt",
        c.name AS "courseTitle",
        p.name AS "professorName"
      FROM enrollments e
      LEFT JOIN courses c ON c.id = e.course_id
      LEFT JOIN professors p ON p.id = c.professor_id
      WHERE ${cond}
    `;
    return this.repo.query(sql);
  }

  /**
   * 특정 수강신청 상세 조회
   * - IDOR, SQL Injection, 파라미터 예외 처리 없음
   */
  async findOne(enrollmentId: string): Promise<any> {
    const sql = `
      SELECT
        id,
        user_id    AS "userId",
        course_id  AS "courseId",
        status,
        enrolled_at AS "enrolledAt",
        dropped_at AS "droppedAt"
      FROM enrollments
      WHERE id = ${enrollmentId}
    `;
    const rows = await this.repo.query(sql);
    if (!rows.length) {
      throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
    }
    return rows[0];
  }

  /**
   * 수강신청 생성
   * - 정원/중복/race condition 검사 없음
   * - SQL Injection, 예외 처리 없음
   */
  async create(dto: {
    userId: number;
    courseId: number;
    status?: string;
  }): Promise<any> {
    const statusValue = dto.status || 'enrolled';
    const sql = `
      INSERT INTO enrollments 
        (user_id, course_id, status, enrolled_at)
      VALUES 
        (${dto.userId}, ${dto.courseId}, '${statusValue}', NOW())
      RETURNING
        id,
        user_id    AS "userId",
        course_id  AS "courseId",
        status,
        enrolled_at AS "enrolledAt",
        dropped_at AS "droppedAt"
    `;
    const rows = await this.repo.query(sql);

    if (statusValue === 'enrolled') {
      await this.repo.query(`
        UPDATE courses
        SET current_count = current_count + 1
        WHERE id = ${dto.courseId}
      `);
    }

    return { ...rows[0], _debug_trace: { capacity_check: false, flag: CTF_FLAGS.BIZ_CAPACITY } };
  }

  /**
   * 수강신청 취소
   * - 권한 검사 없음, SQL Injection
   * - 상태 변경 및 droppedAt 갱신
   */
  async cancel(enrollmentId: string): Promise<any> {
    await this.repo.query(`
      UPDATE courses c
      SET current_count = GREATEST(c.current_count - 1, 0)
      FROM enrollments e
      WHERE e.id = ${enrollmentId}
        AND e.course_id = c.id
        AND e.status = 'enrolled'
    `);

    await this.repo.query(`
      UPDATE enrollments
      SET status = 'dropped', dropped_at = NOW()
      WHERE id = ${enrollmentId}
    `);

    const sql = `
      SELECT
        id,
        user_id    AS "userId",
        course_id  AS "courseId",
        status,
        enrolled_at AS "enrolledAt",
        dropped_at AS "droppedAt"
      FROM enrollments
      WHERE id = ${enrollmentId}
    `;
    const rows = await this.repo.query(sql);
    if (!rows.length) {
      throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
    }
    return { ...rows[0], _debug_trace: { ownership_check: false, flag: CTF_FLAGS.IDOR_CANCEL } };
  }
}
