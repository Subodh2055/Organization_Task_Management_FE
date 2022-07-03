import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RequestClarification} from "./RequestClarification";
import {Organization} from "../add-organization/Organization";

@Injectable({
  providedIn: 'root'
})
export class RequestclarificationService {
  private ApiServiceUrl= environment.ApiBaseUrl;

  constructor(private http: HttpClient) { }

  public getRequestClarification(): Observable<RequestClarification[]>{
    return this.http.get<RequestClarification[]>(`${this.ApiServiceUrl}/api/clarification/all`)
  }

  public addRequestClarification(requestClarification: RequestClarification): Observable<RequestClarification>{
    return this.http.post<RequestClarification>(`${this.ApiServiceUrl}/api/clarification/add`, requestClarification)
  }
  public getUser(): Observable<RequestClarification[]>{
    return this.http.get<RequestClarification[]>(`${this.ApiServiceUrl}/api/users/all`)
  }
  public getRequestClarificationById(id: number): Observable<any>{
    return this.http.get(`${this.ApiServiceUrl}/api/clarification/find/${id}`)
  }

  public updateClarificationById(clarificationId: number, requestClarification: RequestClarification): Observable<RequestClarification> {
    return this.http.put<RequestClarification>(`${this.ApiServiceUrl}/api/clarification/update/${clarificationId}`, requestClarification)

  }

  public updateClarification(requestClarification: RequestClarification, id: number): Observable<RequestClarification> {
    return this.http.put<RequestClarification>(`${this.ApiServiceUrl}/api/clarification/update/${id}`, requestClarification)

  }
}
