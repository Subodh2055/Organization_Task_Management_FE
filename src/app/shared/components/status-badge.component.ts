import { Component, input } from '@angular/core';

import { ClarificationStatus } from '../../core/models/clarification.model';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [class]="status() === 'PENDING' ? 'text-bg-warning' : 'text-bg-success'">
      {{ status() === 'PENDING' ? 'Pending' : 'Closed' }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<ClarificationStatus>();
}
