import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {SignUp} from "./SignUp";

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private ApiServiceUrl= environment.ApiBaseUrl;

  constructor(private http: HttpClient) { }

  public getUser(): Observable<SignUp>{
    return this.http.get<SignUp>(`${this.ApiServiceUrl}/api/users/all`)
  }

  public addUser(signUp: SignUp): Observable<SignUp>{
    return this.http.post<SignUp>(`${this.ApiServiceUrl}/api/auth/signup`, signUp)
  }
  public getByUserName(userName: string): Observable<any>{
    return this.http.get(`${this.ApiServiceUrl}/api/users/findByUserName/${userName}`)
  }
}
