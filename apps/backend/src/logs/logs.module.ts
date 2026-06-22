import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { ErrorLog } from './entities/error-log.entity';

/**
 * 감사/에러 로그 HTTP API는 제거되었으나, DB 엔티티 스키마 유지를 위해 등록만 한다.
 */
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, ErrorLog])],
  exports: [TypeOrmModule],
})
export class LogsModule {}
