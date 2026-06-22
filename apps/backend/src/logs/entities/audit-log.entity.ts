import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId!: number;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 50 })
  resourceType!: string;

  @Column({ name: 'resource_id', type: 'bigint', nullable: true })
  resourceId!: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 50 })
  ipAddress!: string;

  @Column({ name: 'request_method', type: 'varchar', length: 10 })
  requestMethod!: string;

  @Column({ name: 'request_path', type: 'varchar', length: 200 })
  requestPath!: string;

  @Column({ name: 'response_status', type: 'integer' })
  responseStatus!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
