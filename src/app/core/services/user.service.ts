import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';
import { CreateUserRequest, Role, User, UserSummary } from '../models/user.model';

export interface UserQuery {
  role?: Role | null;
  search?: string | null;
  /** Zero-based page number. */
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  /** Admin only. */
  search(query: UserQuery): Observable<Page<User>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.role) {
      params = params.set('role', query.role);
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    return this.http.get<Page<User>>(this.url, { params });
  }

  /** Admin only. */
  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.url, request);
  }

  /** Admin only. */
  setActive(id: number, active: boolean): Observable<User> {
    return this.http.patch<User>(`${this.url}/${id}/status`, { active });
  }

  /** Staff get the project organization's customers; customers get staff. */
  assignable(projectId?: number | null): Observable<UserSummary[]> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    return this.http.get<UserSummary[]>(`${this.url}/assignable`, { params });
  }
}
