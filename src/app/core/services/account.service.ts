import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Dashboard, MessageResponse } from '../models/page.model';
import { Availability, RegisterRequest, User } from '../models/user.model';

/** Registration, password management, the current user and their dashboard. */
@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  /** Public: always creates a CUSTOMER account. */
  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.url}/auth/register`, request);
  }

  availability(check: { userName?: string; email?: string }): Observable<Availability> {
    return this.http.get<Availability>(`${this.url}/auth/availability`, { params: { ...check } });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.url}/auth/me`);
  }

  updatePreferences(emailNotifications: boolean): Observable<User> {
    return this.http.put<User>(`${this.url}/auth/preferences`, { emailNotifications });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.url}/auth/change-password`, { currentPassword, newPassword });
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.url}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.url}/auth/reset-password`, { token, newPassword });
  }

  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.url}/dashboard`);
  }
}
