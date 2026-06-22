import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as pg from 'pg';

// BIGINT(oid 20)도 JSON 직렬화 전 number로 파싱
pg.types.setTypeParser(20, (value: string) => parseInt(value, 10));

export const createTypeOrmConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => {
  const useSsl = config.get<string>('DB_SSL', 'false') === 'true';
  return {
  type: 'postgres',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: Number(config.get<string>('DB_PORT', '5432')),
  username: config.get<string>('DB_USERNAME', 'broken_regist'),
  password: config.get<string>('DB_PASSWORD', 'broken_regist_password'),
  database: config.get<string>('DB_DATABASE', 'broken_regist'),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  autoLoadEntities: true,
  synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
  };
};
