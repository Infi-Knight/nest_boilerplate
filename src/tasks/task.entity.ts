import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TaskStatus } from './task-status.enum';
import { User } from 'src/auth/user.entity';

// If you want to use the Active record pattern (query methods in the model itself)
// You need to extend the entity with BaseEntity and then implement static methods in the model (entity)

// Here I am using the data mapper pattern, whose repository is in task.repository.ts
@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  // eager loading can be enabled for only one side of the relationship
  @ManyToOne(
    () => User,
    user => user.tasks,
    { eager: false },
  )
  user: User;

  // typeorm generates a userId column automatically but we still need our entity to be aware of it:
  @Column()
  userId: number;

  @Column()
  status: TaskStatus;
}
