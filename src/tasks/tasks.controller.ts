import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task-dto';
import { GetTasksByFilterDto } from './dto/get-tasks-by-filter-dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation-pipe';
import { Task } from './task.entity';
import { FilterStatusUppercaseTransformationPipe } from './pipes/filter-transformation-pipe';
import { User } from 'src/auth/user.entity';
import { GetCurrentlyAuthenticatedUser } from 'src/auth/get-user.decorator';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController');
  constructor(private tasksService: TasksService) {}

  @Get()
  @UsePipes(FilterStatusUppercaseTransformationPipe)
  getTasks(
    @Query(ValidationPipe) filterDto: GetTasksByFilterDto,
    @GetCurrentlyAuthenticatedUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(
      `User ${user.username} retrieving his tasks. Filters: ${JSON.stringify(
        filterDto,
      )}`,
    );
    return this.tasksService.getTasks(filterDto, user);
  }

  // ParseIntPipe and other pipes help us in runtime, typescript types in compile time
  @Get(':id')
  getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentlyAuthenticatedUser() user: User,
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // return an error if the client sends a request with additional properties
    }),
  )
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetCurrentlyAuthenticatedUser() user: User,
  ): Promise<Task> {
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Patch(':id/status')
  updateTaskStatusById(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentlyAuthenticatedUser() user: User,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    // @Body('status', new TaskStatusValidationPipe()) status: TaskStatus, // If you to run some configuration on your end you could provide an instance: new TaskStatusValidationPipe(obj)
  ): Promise<Task> {
    return this.tasksService.updateTaskStatusById(id, status, user);
  }

  @Delete(':id')
  deleteTaskById(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentlyAuthenticatedUser() user: User,
  ): Promise<void> {
    return this.tasksService.deleteTaskById(id, user);
  }
}
