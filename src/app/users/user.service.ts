import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {AppUser, Role} from "../core/auth.models";
import {Organization} from "../add-organization/Organization";

export interface CreateUser {
  fullName: string;
  designation: string;
  organizationName: Organization | null;
  email: string;
  mobile: string;
  userName: string;
  password: string;
  role: Role;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private ApiServiceUrl = environment.ApiBaseUrl;

  constructor(private http: HttpClient) { }

  /** Admin only. */
  public getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.ApiServiceUrl}/api/users/all`)
  }

  /** Admin only. */
  public addUser(user: CreateUser): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.ApiServiceUrl}/api/users/add`, user)
  }

  /** Staff get customers, customers get staff. */
  public getAssignableUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.ApiServiceUrl}/api/users/assignable`)
  }
}
