import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RequestClarification} from "./RequestClarification";

export type ClarificationScope = 'all' | 'assigned' | 'requested';

@Injectable({
  providedIn: 'root'
})
export class RequestclarificationService {
  private ApiServiceUrl= environment.ApiBaseUrl;

  constructor(private http: HttpClient) { }

  /** Admin only. */
  public getRequestClarification(): Observable<RequestClarification[]>{
    return this.http.get<RequestClarification[]>(`${this.ApiServiceUrl}/api/clarification/all`)
  }

  /** assigned: requested from me. requested: raised by me. */
  public getMyClarifications(scope: 'assigned' | 'requested'): Observable<RequestClarification[]>{
    return this.http.get<RequestClarification[]>(`${this.ApiServiceUrl}/api/clarification/mine`, {params: {scope}})
  }

  public getClarifications(scope: ClarificationScope): Observable<RequestClarification[]>{
    return scope === 'all' ? this.getRequestClarification() : this.getMyClarifications(scope);
  }

  public addRequestClarification(requestClarification: Partial<RequestClarification>): Observable<RequestClarification>{
    return this.http.post<RequestClarification>(`${this.ApiServiceUrl}/api/clarification/add`, requestClarification)
  }

  public getRequestClarificationById(id: number): Observable<RequestClarification>{
    return this.http.get<RequestClarification>(`${this.ApiServiceUrl}/api/clarification/find/${id}`)
  }

  /** Only the user the clarification was requested from can answer it. */
  public answerClarification(id: number, provideClarification: string): Observable<RequestClarification> {
    return this.http.patch<RequestClarification>(`${this.ApiServiceUrl}/api/clarification/${id}/answer`, {provideClarification})
  }
}
