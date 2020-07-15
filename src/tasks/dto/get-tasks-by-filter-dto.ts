import { TaskStatus } from '../task-status.enum';
import { IsOptional, IsNotEmpty, Matches } from 'class-validator';

/* /^OPEN|IN_PROGRESS|DONE$/i */
const ValidTaskStatusRegex = new RegExp(
  `^(${Object.values(TaskStatus).join('|')})$`,
  'i',
);

export class GetTasksByFilterDto {
  @IsOptional()
  @Matches(ValidTaskStatusRegex, {
    message: ({ value }) => {
      return `${value} is not a valid status`;
    },
  })
  status: TaskStatus;

  @IsOptional()
  @IsNotEmpty()
  search: string;
}
