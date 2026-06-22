import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'professors' })
export class Professor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ name: 'user_id', type: 'bigint', unique: true })
  userId!: number;

  @OneToOne(() => User, (user) => user.professor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({
    name: 'department_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  departmentName!: string | null;

  @OneToMany(() => Course, (course) => course.professor)
  courses!: Course[];
}
