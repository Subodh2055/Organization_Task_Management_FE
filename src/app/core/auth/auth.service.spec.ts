import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/user.model';
import { AuthService, homeUrlFor } from './auth.service';

const response = (expiresInMs: number): AuthResponse => ({
  token: 'jwt-token',
  expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
  user: {
    id: 1, fullName: 'Sam Staff', designation: 'Engineer', organization: null, email: 'sam@co.com',
    mobile: '9800000000', userName: 'staff1', role: 'STAFF', active: true, emailNotifications: true, createdAt: new Date().toISOString(),
  },
});

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('maps each role to its portal', () => {
    expect(homeUrlFor('ADMIN')).toBe('/admin');
    expect(homeUrlFor('STAFF')).toBe('/staff');
    expect(homeUrlFor('CUSTOMER')).toBe('/customer');
    expect(homeUrlFor(null)).toBe('/login');
  });

  it('stores the session after login', () => {
    service.login('staff1', 'secret123').subscribe();
    const request = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.body).toEqual({ username: 'staff1', password: 'secret123' });
    request.flush(response(60_000));

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.token).toBe('jwt-token');
    expect(service.role()).toBe('STAFF');
    expect(service.homeUrl()).toBe('/staff');
    expect(localStorage.getItem('otm_auth')).toContain('jwt-token');
  });

  it('treats an expired token as logged out', () => {
    service.login('staff1', 'secret123').subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(response(-1000));

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.token).toBeNull();
  });

  it('clears the session on logout', () => {
    service.login('staff1', 'secret123').subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(response(60_000));

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.user()).toBeNull();
    expect(localStorage.getItem('otm_auth')).toBeNull();
  });
});
