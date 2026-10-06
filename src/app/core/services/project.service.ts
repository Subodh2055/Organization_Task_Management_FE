import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Project, ProjectRequest } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/projects`;

  /** Customers only get their organization's projects; everyone else gets all (optionally filtered). */
  list(organizationId?: number | null): Observable<Project[]> {
    let params = new HttpParams();
    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }
    return this.http.get<Project[]>(this.url, { params });
  }

  /** Admin only. */
  create(request: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.url, request);
  }
}
