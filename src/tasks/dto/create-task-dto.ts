import { IsNotEmpty } from 'class-validator';
// A DTO defines the shape of data for a specific use case like
// shape of data for creating new task

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
