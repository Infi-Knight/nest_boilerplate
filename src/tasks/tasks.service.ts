import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task-dto';
import { GetTasksByFilterDto } from './dto/get-tasks-by-filter-dto';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
  ) {}

  // https://docs.nestjs.com/techniques/database#custom-repository
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // creating a task and saving it in database is the job of persistance layer
    // so we have delegated the job of creating and saving the entity in the repository
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async getTasks(filterDto: GetTasksByFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!found) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }
    return found;
  }

  async updateTaskStatusById(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    // Two database calls, dosen't feel good
    // An alternative would be to not return the updated task
    const updateResult = await this.taskRepository.update(id, { status });
    if (updateResult.affected == 0) {
      // we are going to return a 404 both for not found tasks as well as unauthorized access
      // as a security measure
      throw new NotFoundException(`Task with id: ${id} not found`);
    }
    return this.getTaskById(id, user);
  }

  async deleteTaskById(id: number, user: User): Promise<void> {
    // we are using delete instead of remove to avoid finding a task and then deleting it, which will
    // result in two database calls
    const deleteResult = await this.taskRepository.delete({
      id,
      userId: user.id,
    });
    if (deleteResult.affected == 0) {
      throw new NotFoundException(`Task with id: ${id} not found`);
    }
  }
}
