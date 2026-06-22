import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Flag } from './flag.entity';

@Unique(['flagId'])
@Entity({ name: 'captured_flags' })
export class CapturedFlag {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ name: 'flag_id', type: 'bigint' })
  flagId!: number;

  @ManyToOne(() => Flag, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'flag_id' })
  flag!: Flag;

  @Column({ name: 'captured_at', type: 'timestamptz', default: () => 'now()' })
  capturedAt!: Date;
}
