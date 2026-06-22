import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Flag } from './flag.entity';

@Unique(['userId', 'flagId'])
@Entity({ name: 'user_flags' })
export class UserFlag {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @Column({ name: 'flag_id', type: 'bigint' })
  flagId!: number;

  @ManyToOne(() => Flag, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'flag_id' })
  flag!: Flag;

  @Column({ name: 'captured_at', type: 'timestamptz', default: () => 'now()' })
  capturedAt!: Date;
}
