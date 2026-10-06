import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';
import { MessageResponse, Page } from '../models/page.model';

/** The current user's in-app notifications; keeps the unread count the navbar bell shows. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notifications`;

  readonly unreadCount = signal(0);

  list(page: number, size: number): Observable<Page<AppNotification>> {
    return this.http.get<Page<AppNotification>>(this.url, { params: { page, size } });
  }

  refreshUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.url}/unread-count`).subscribe({
      next: result => this.unreadCount.set(result.count),
      error: () => {
        // A failed poll is not worth interrupting the user; the next one will retry.
      },
    });
  }

  markRead(id: number): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.url}/${id}/read`, {}).pipe(
      tap(() => this.unreadCount.update(count => Math.max(0, count - 1))),
    );
  }

  markAllRead(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.url}/read-all`, {}).pipe(tap(() => this.unreadCount.set(0)));
  }
}
