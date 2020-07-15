import { Repository, EntityRepository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task-dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksByFilterDto } from './dto/get-tasks-by-filter-dto';
import { User } from 'src/auth/user.entity';
import { Logger, InternalServerErrorException } from '@nestjs/common';

// For using data mapper pattern (query methods in 'repositories')
// https://docs.nestjs.com/techniques/database#custom-repository
@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');
  async getTasks(filterDto: GetTasksByFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task'); // 'task' is the alias in sql query

    query.where('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      // since eager loading is enabled only on user entity thus loading a task does not automatically
      // load the associated user
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve the tasks for the User: ${
          user.username
        }. Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    // create is available from typeorm
    const task = this.create({
      title,
      description,
      user,
      status: TaskStatus.OPEN,
    });

    try {
      await this.save(task);
      // don't send back the whole of task object because now it contains sensitive information like
      // user password and salt. So while returning the newly created task delte the user property from it
      delete task.user;

      return task;
    } catch (error) {
      this.logger.error(
        `Failed to create a task for the User: user.username. Data: ${JSON.stringify(
          createTaskDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException(`Failed to create the task`);
    }
  }
}
