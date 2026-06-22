import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from './entities/professor.entity';

/** Professor 엔티티만 등록 (User·Course 관계용). HTTP API 없음. */
@Module({
  imports: [TypeOrmModule.forFeature([Professor])],
  exports: [TypeOrmModule],
})
export class ProfessorsModule {}
