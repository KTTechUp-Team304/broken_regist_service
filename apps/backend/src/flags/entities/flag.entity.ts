import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'flags' })
export class Flag {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column()
  category!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  hint!: string;

  @Column({ name: 'flag_value', unique: true })
  flagValue!: string;

  @Column({ default: 100 })
  points!: number;

  @Column({ default: 1 })
  difficulty!: number;
}
