import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Organization, OrganizationRequest } from '../models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/organizations`;

  /** Public: also used by the registration form. */
  list(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.url);
  }

  /** Admin only. */
  create(request: OrganizationRequest): Observable<Organization> {
    return this.http.post<Organization>(this.url, request);
  }
}
