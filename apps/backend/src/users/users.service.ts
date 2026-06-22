import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CTF_FLAGS } from '../flags/ctf-flags.constants';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  /**
   * 사용자 상세 조회
   * - raw SQL을 사용하여 SQL Injection에 노출됨
   * - 권한 검증이 없어 누구나 접근 가능 (IDOR 취약)
   * - passwordHash를 그대로 반환
   * - 잘못된 userId 입력 시 DB 오류 및 스택 트레이스 노출
   */
  async findById(userId: string): Promise<any> {
    const sql = `
      SELECT
        id,
        username,
        role,
        created_at        AS "createdAt",
        recent_login_date AS "recentLoginDate",
        status,
        password_hash     AS "passwordHash"
      FROM users
      WHERE id = ${userId}
    `;
    const rows = await this.repo.query(sql);

    if (!rows.length) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return { ...rows[0], _debug_trace: { sensitive_field_exposed: 'passwordHash', flag: CTF_FLAGS.IDOR_USER_HASH } };
  }

  /**
   * 전체 사용자 목록 조회
   * - 관리자 권한 검사가 빠져 있음
   * - passwordHash를 포함하여 반환
   */
  async findAll(): Promise<any[]> {
    const sql = `
      SELECT
        id,
        username,
        role,
        created_at        AS "createdAt",
        recent_login_date AS "recentLoginDate",
        status,
        password_hash     AS "passwordHash"
      FROM users
      ORDER BY id ASC
    `;
    return this.repo.query(sql);
  }

  /**
   * 사용자 role 변경
   * - 권한 검증 및 입력값 검증 없이 처리
   * - SQL Injection에 노출됨
   */
  async changeRole(userId: string, newRole: string): Promise<any> {
    const updateSql = `
      UPDATE users
      SET role = '${newRole}'
      WHERE id = ${userId}
    `;
    await this.repo.query(updateSql);

    const selectSql = `
      SELECT
        id,
        username,
        role,
        created_at        AS "createdAt",
        recent_login_date AS "recentLoginDate",
        status,
        password_hash     AS "passwordHash"
      FROM users
      WHERE id = ${userId}
    `;
    const rows = await this.repo.query(selectSql);

    if (!rows.length) {
      throw new NotFoundException(`User ${userId} not found after role change`);
    }
    return { ...rows[0], _debug_trace: { role_updated: true, flag: CTF_FLAGS.BFLA_ROLE } };
  }
}
