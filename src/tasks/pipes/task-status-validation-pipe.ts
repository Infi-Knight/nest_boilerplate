import { PipeTransform, BadRequestException } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatuses = [
    TaskStatus.DONE,
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
  ];

  transform(value: string) {
    // validate that the status client has send us is one of allowed task statuses
    const statusSentByClient = value;
    const transformedStatus = value.toUpperCase();
    if (!this.isValidStatus(transformedStatus)) {
      throw new BadRequestException(
        `${statusSentByClient} is an invalid status`,
      );
    }

    return transformedStatus;
  }

  private isValidStatus(status: any) {
    const idx = this.allowedStatuses.indexOf(status);
    return idx != -1;
  }
}
