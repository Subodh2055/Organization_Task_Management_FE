import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../core/auth/auth.service';
import { AppNotification, NotificationType } from '../../core/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/notifications/toast.service';
import { errorMessage } from '../../core/utils/api-error';

const LABELS: Record<NotificationType, string> = {
  CLARIFICATION_REQUESTED: 'New request',
  CLARIFICATION_ANSWERED: 'Answered',
  COMMENT_ADDED: 'Comment',
  CLARIFICATION_REASSIGNED: 'Reassigned',
  CLARIFICATION_REOPENED: 'Reopened',
  CLARIFICATION_UPDATED: 'Updated',
  DUE_SOON: 'Due soon',
  OVERDUE: 'Overdue',
};

/** All of the current user's notifications, newest first. */
@Component({
  selector: 'app-notifications',
  imports: [NgbPagination, DatePipe],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  protected readonly notificationService = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly labels = LABELS;
  protected readonly pageSize = 15;
  protected readonly items = signal<AppNotification[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.notificationService.list(this.page() - 1, this.pageSize).subscribe({
      next: result => {
        this.items.set(result.content);
        this.total.set(result.totalElements);
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.toast.error(errorMessage(error, 'Failed to load notifications'));
      },
    });
  }

  onPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  open(notification: AppNotification): void {
    const go = () => {
      if (notification.clarificationId) {
        this.router.navigate([this.auth.homeUrl(), 'clarifications', notification.clarificationId]);
      }
    };
    if (notification.read) {
      go();
    } else {
      this.notificationService.markRead(notification.id).subscribe({ next: go, error: go });
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => this.items.update(items => items.map(item => ({ ...item, read: true }))),
      error: error => this.toast.error(errorMessage(error, 'Could not mark notifications as read')),
    });
  }

  badgeClass(type: NotificationType): string {
    switch (type) {
      case 'OVERDUE':
        return 'text-bg-danger';
      case 'DUE_SOON':
        return 'text-bg-warning';
      case 'CLARIFICATION_ANSWERED':
        return 'text-bg-success';
      case 'CLARIFICATION_REOPENED':
      case 'CLARIFICATION_REASSIGNED':
      case 'CLARIFICATION_UPDATED':
        return 'text-bg-info';
      default:
        return 'text-bg-secondary';
    }
  }
}
