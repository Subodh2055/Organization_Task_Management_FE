import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {Project} from "./Project";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private ApiServiceUrl= environment.ApiBaseUrl;

  constructor(private http: HttpClient) { }

  public getProject(): Observable<Project>{
    return this.http.get<Project>(`${this.ApiServiceUrl}/project/all`)
  }

  public addProject(project: Project): Observable<any>{
    return this.http.post<Project>(`${this.ApiServiceUrl}/api/projectcreation/add`, project)
  }
}
