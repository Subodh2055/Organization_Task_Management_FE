import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, Role, User } from '../models/user.model';

const STORAGE_KEY = 'otm_auth';

/** Where each role lands after login. */
export function homeUrlFor(role: Role | null): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'STAFF':
      return '/staff';
    case 'CUSTOMER':
      return '/customer';
    default:
      return '/login';
  }
}

/** The logged-in user and their JWT, kept in localStorage across page reloads. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<AuthResponse | null>(restore());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly role = computed(() => this.user()?.role ?? null);
  readonly homeUrl = computed(() => homeUrlFor(this.role()));

  /** True while a session exists and its token has not expired. */
  isLoggedIn(): boolean {
    const session = this.session();
    return session !== null && new Date(session.expiresAt).getTime() > Date.now();
  }

  get token(): string | null {
    return this.isLoggedIn() ? this.session()!.token : null;
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(tap(response => this.store(response)));
  }

  logout(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (e.g. private mode): nothing to clear.
    }
  }

  private store(response: AuthResponse): void {
    this.session.set(response);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    } catch {
      // Storage unavailable: the session still lasts until the page is reloaded.
    }
  }
}

function restore(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}
