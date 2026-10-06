import { Pipe, PipeTransform } from '@angular/core';

import { label } from '../../core/models/clarification.model';

/** "REQUIREMENTS" -> "Requirements". */
@Pipe({ name: 'label' })
export class LabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? label(value) : '';
  }
}
