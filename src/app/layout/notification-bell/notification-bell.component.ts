import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { AppNotification } from '../../core/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';

const POLL_MS = 30_000;

/** Navbar bell: unread count (polled), and the latest notifications when opened. */
@Component({
  selector: 'app-notification-bell',
  imports: [NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, RouterLink, DatePipe],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss',
})
export class NotificationBellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly latest = signal<AppNotification[]>([]);
  protected readonly loading = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Poll while someone is logged in; stop when they log out.
    effect(onCleanup => {
      if (!this.auth.user()) {
        this.notifications.unreadCount.set(0);
        return;
      }
      this.notifications.refreshUnreadCount();
      const timer = setInterval(() => this.notifications.refreshUnreadCount(), POLL_MS);
      onCleanup(() => clearInterval(timer));
    });

    // Also refresh on every page change, so the count follows what the user just did.
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        if (this.auth.isLoggedIn()) {
          this.notifications.refreshUnreadCount();
        }
      });
  }

  onOpenChange(open: boolean): void {
    if (!open) {
      return;
    }
    // Keep the badge in step with the list being shown.
    this.notifications.refreshUnreadCount();
    this.loading.set(true);
    this.notifications.list(0, 8).subscribe({
      next: page => {
        this.latest.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  open(notification: AppNotification, dropdown: NgbDropdown): void {
    dropdown.close();
    const go = () => {
      if (notification.clarificationId) {
        this.router.navigate([this.auth.homeUrl(), 'clarifications', notification.clarificationId]);
      }
    };
    if (notification.read) {
      go();
      return;
    }
    this.notifications.markRead(notification.id).subscribe({ next: go, error: go });
  }

  markAllRead(): void {
    this.notifications.markAllRead().subscribe(() => this.latest.update(list => list.map(n => ({ ...n, read: true }))));
  }
}
