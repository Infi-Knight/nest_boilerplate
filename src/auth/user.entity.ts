import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from 'typeorm';
import { Task } from 'src/tasks/task.entity';

@Entity()
@Unique(['username']) // we don't want duplicate usernames in our database. Note that this constraint is at db level
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  // a User can have many tasks
  // with eager loading enabled, tasks will be loaded automatically when a user is loaded
  @OneToMany(
    () => Task,
    task => task.user,
    { eager: true },
  )
  tasks: Task[];

  @Column()
  passwordSalt: string;
}
