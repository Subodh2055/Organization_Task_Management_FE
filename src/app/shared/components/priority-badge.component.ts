import { Component, computed, input } from '@angular/core';

import { ClarificationPriority, label } from '../../core/models/clarification.model';

const CSS: Record<ClarificationPriority, string> = {
  LOW: 'text-bg-light border',
  NORMAL: 'text-bg-secondary',
  HIGH: 'text-bg-warning',
  URGENT: 'text-bg-danger',
};

@Component({
  selector: 'app-priority-badge',
  template: `<span [class]="'badge ' + css()">{{ text() }}</span>`,
})
export class PriorityBadgeComponent {
  readonly priority = input.required<ClarificationPriority>();

  protected readonly css = computed(() => CSS[this.priority()]);
  protected readonly text = computed(() => label(this.priority()));
}
