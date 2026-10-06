import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { AccountService } from '../../core/services/account.service';
import { ToastService } from '../../core/notifications/toast.service';
import { errorMessage } from '../../core/utils/api-error';

interface Card {
  key: string;
  label: string;
  link: string;
  tone: 'primary' | 'info' | 'warning' | 'success' | 'danger';
  /** Opens the list already filtered, e.g. { filter: 'overdue' }. */
  query?: Record<string, string>;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly account = inject(AccountService);
  private readonly toast = inject(ToastService);

  protected readonly counts = signal<Record<string, number> | null>(null);

  protected readonly cards = computed<Card[]>(() => {
    const base = this.auth.homeUrl();
    if (this.auth.role() === 'ADMIN') {
      return [
        { key: 'organizations', label: 'Organizations', link: `${base}/organizations`, tone: 'primary' },
        { key: 'projects', label: 'Projects', link: `${base}/projects`, tone: 'primary' },
        { key: 'staff', label: 'Staff', link: `${base}/users`, tone: 'info' },
        { key: 'customers', label: 'Customers', link: `${base}/users`, tone: 'info' },
        { key: 'pending', label: 'Pending clarifications', link: `${base}/clarifications`, tone: 'warning', query: { filter: 'pending' } },
        { key: 'overdue', label: 'Overdue clarifications', link: `${base}/clarifications`, tone: 'danger', query: { filter: 'overdue' } },
        { key: 'closed', label: 'Closed clarifications', link: `${base}/clarifications`, tone: 'success', query: { filter: 'closed' } },
      ];
    }
    return [
      { key: 'assignedOverdue', label: 'Overdue, waiting for my answer', link: `${base}/assigned`, tone: 'danger', query: { filter: 'overdue' } },
      { key: 'assignedPending', label: 'Waiting for my answer', link: `${base}/assigned`, tone: 'warning', query: { filter: 'pending' } },
      { key: 'assignedClosed', label: 'Answered by me', link: `${base}/assigned`, tone: 'success', query: { filter: 'closed' } },
      { key: 'requestedPending', label: 'My open requests', link: `${base}/requests`, tone: 'warning', query: { filter: 'pending' } },
      { key: 'requestedOverdue', label: 'My overdue requests', link: `${base}/requests`, tone: 'danger', query: { filter: 'overdue' } },
      { key: 'requestedClosed', label: 'My answered requests', link: `${base}/requests`, tone: 'success', query: { filter: 'closed' } },
    ];
  });

  protected readonly intro = computed(() => {
    switch (this.auth.role()) {
      case 'ADMIN':
        return 'Manage organizations, projects, users and every clarification.';
      case 'STAFF':
        return 'Answer what customers ask you, and ask customers for clarification.';
      default:
        return 'Answer what staff ask you, and ask staff for clarification.';
    }
  });

  ngOnInit(): void {
    this.account.dashboard().subscribe({
      next: dashboard => this.counts.set(dashboard.counts),
      error: error => this.toast.error(errorMessage(error, 'Failed to load the dashboard')),
    });
  }
}
