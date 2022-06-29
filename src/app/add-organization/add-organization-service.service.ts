import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Organization} from "./Organization";

@Injectable({
  providedIn: 'root'
})
export class AddOrganizationServiceService {

  private ApiServiceUrl= environment.ApiBaseUrl;

  constructor(private http: HttpClient) { }

  public getOrganization(): Observable<Organization[]>{
    return this.http.get<Organization[]>(`${this.ApiServiceUrl}/api/organization/all`)
  }

  public addOrganization(organization: Organization): Observable<Organization>{
    return this.http.post<Organization>(`${this.ApiServiceUrl}/api/organization/add`, organization)
  }

  public getOrganizationById(id: number): Observable<any>{
    return this.http.get(`${this.ApiServiceUrl}/api/organization/find/${id}`)
  }

  public deleteOrganization(organizationId: number): Observable<void>{
    return this.http.delete<void>(`${this.ApiServiceUrl}/api/organization/delete/${organizationId}`)

  }

  public updateOrganization(userId: number, organization: Organization): Observable<Organization>{
    return this.http.put<Organization>(`${this.ApiServiceUrl}/api/organization/update/${userId}`, organization)
  }
  public getOrganizationByEmail(email: string): Observable<any>{
    return this.http.get(`${this.ApiServiceUrl}/api/users/findByEmail/${email}`)
  }
}

