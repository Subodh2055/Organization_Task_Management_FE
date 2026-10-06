import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Clarification,
  ClarificationAttachment,
  ClarificationComment,
  ClarificationDetail,
  ClarificationQuery,
  CreateClarificationRequest,
} from '../models/clarification.model';
import { Page } from '../models/page.model';
import { UserSummary } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ClarificationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/clarifications`;

  search(query: ClarificationQuery): Observable<Page<Clarification>> {
    let params = new HttpParams().set('scope', query.scope).set('page', query.page).set('size', query.size);
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.overdue) {
      params = params.set('overdue', true);
    }
    if (query.projectId) {
      params = params.set('projectId', query.projectId);
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    return this.http.get<Page<Clarification>>(this.url, { params });
  }

  create(request: CreateClarificationRequest): Observable<Clarification> {
    return this.http.post<Clarification>(this.url, request);
  }

  detail(id: number): Observable<ClarificationDetail> {
    return this.http.get<ClarificationDetail>(`${this.url}/${id}`);
  }

  /** Only the user it was asked of can answer, once. */
  answer(id: number, answer: string): Observable<Clarification> {
    return this.http.post<Clarification>(`${this.url}/${id}/answer`, { answer });
  }

  /** People a pending clarification can be handed to. */
  reassignCandidates(id: number): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.url}/${id}/reassign-candidates`);
  }

  /** The requester, the assignee or an admin hands it to someone else. */
  reassign(id: number, requestedToId: number, note: string | null): Observable<Clarification> {
    return this.http.post<Clarification>(`${this.url}/${id}/reassign`, { requestedToId, note });
  }

  /** The requester or an admin reopens an answered clarification. */
  reopen(id: number, reason: string): Observable<Clarification> {
    return this.http.post<Clarification>(`${this.url}/${id}/reopen`, { reason });
  }

  addComment(id: number, body: string): Observable<ClarificationComment> {
    return this.http.post<ClarificationComment>(`${this.url}/${id}/comments`, { body });
  }

  uploadAttachment(id: number, file: File): Observable<ClarificationAttachment> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<ClarificationAttachment>(`${this.url}/${id}/attachments`, form);
  }

  downloadAttachment(id: number, attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/attachments/${attachmentId}`, { responseType: 'blob' });
  }

  deleteAttachment(id: number, attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/attachments/${attachmentId}`);
  }
}
