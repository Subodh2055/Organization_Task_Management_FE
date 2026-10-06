import { Component, computed, input } from '@angular/core';

import { ClarificationStatus } from '../../core/models/clarification.model';

/** Pending (yellow), Overdue (red: pending past its due date) or Closed (green). */
@Component({
  selector: 'app-status-badge',
  template: `<span [class]="'badge ' + view().css">{{ view().label }}</span>`,
})
export class StatusBadgeComponent {
  readonly status = input.required<ClarificationStatus>();
  readonly overdue = input(false);

  protected readonly view = computed(() => {
    if (this.status() === 'CLOSED') {
      return { label: 'Closed', css: 'text-bg-success' };
    }
    return this.overdue() ? { label: 'Overdue', css: 'text-bg-danger' } : { label: 'Pending', css: 'text-bg-warning' };
  });
}
