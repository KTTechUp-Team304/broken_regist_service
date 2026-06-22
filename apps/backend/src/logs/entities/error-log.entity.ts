import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'error_logs' })
export class ErrorLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ name: 'error_type', type: 'varchar', length: 100 })
  errorType!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'stack_trace', type: 'text' })
  stackTrace!: string;

  @Column({ name: 'request_path', type: 'varchar', length: 200 })
  requestPath!: string;

  @Column({ name: 'request_method', type: 'varchar', length: 10 })
  requestMethod!: string;

  @Column({ name: 'request_body', type: 'text', nullable: true })
  requestBody!: string;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId!: number;

  @ManyToOne(() => User, (user) => user.errorLogs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
