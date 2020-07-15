import { PipeTransform } from '@nestjs/common';

// This pipe converts the status (if any) sent by client to uppercase
// so that it conform to our TaskStatus in the DTO
export class FilterStatusUppercaseTransformationPipe implements PipeTransform {
  transform(value) {
    if (value.status) {
      value.status = value.status.toUpperCase();
    }
    return value;
  }
}
