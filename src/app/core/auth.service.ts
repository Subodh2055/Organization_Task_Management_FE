import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {environment} from "../../environments/environment";
import {AppUser, AuthResponse, Role} from "./auth.models";

const STORAGE_KEY = 'otm_auth';

/** Holds the logged-in user and their JWT, persisted in localStorage across page reloads. */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private ApiServiceUrl = environment.ApiBaseUrl;
  private session: AuthResponse | null = this.restore();

  constructor(private http: HttpClient) { }

  public login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.ApiServiceUrl}/api/auth/signin`, {username, password}).pipe(
      tap(response => this.store(response))
    );
  }

  public logout(): void {
    this.session = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (e.g. private mode): nothing to clear.
    }
  }

  get isLoggedIn(): boolean {
    return this.session !== null && new Date(this.session.expiresAt).getTime() > Date.now();
  }

  get token(): string | null {
    return this.isLoggedIn ? this.session!.token : null;
  }

  get user(): AppUser | null {
    return this.isLoggedIn ? this.session!.user : null;
  }

  get role(): Role | null {
    return this.user?.role ?? null;
  }

  /** Where each role lands after login. */
  public homeUrl(role: Role | null = this.role): string {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'STAFF':
        return '/staff';
      case 'CUSTOMER':
        return '/customer';
      default:
        return '/signIn';
    }
  }

  private store(response: AuthResponse) {
    this.session = response;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    } catch {
      // Storage unavailable: the session still lasts until the page is reloaded.
    }
  }

  private restore(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as AuthResponse : null;
    } catch {
      return null;
    }
  }
}
