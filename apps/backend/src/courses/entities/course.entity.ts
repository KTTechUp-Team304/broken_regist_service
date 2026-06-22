import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { FileResource } from '../../files/entities/file.entity';
import { Professor } from '../../professors/entities/professor.entity';

@Check('CHK_courses_capacity', 'current_count <= max_capacity')
@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'professor_id', type: 'bigint' })
  professorId!: number;

  @ManyToOne(() => Professor, (professor) => professor.courses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string | null;

  @Column({ name: 'lecture_time', type: 'varchar', length: 200, nullable: true })
  lectureTime!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  classroom!: string | null;

  @Column({ type: 'int', nullable: true })
  credits!: number | null;

  @Column({ name: 'max_capacity', type: 'int', default: 30 })
  maxCapacity!: number;

  @Column({ name: 'current_count', type: 'int', default: 0 })
  currentCount!: number;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  isVisible!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments!: Enrollment[];

  @OneToMany(() => FileResource, (file) => file.course)
  files!: FileResource[];
}
