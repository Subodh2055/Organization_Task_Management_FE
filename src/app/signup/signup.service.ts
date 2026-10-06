import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {SignUp} from "./SignUp";

export interface Availability {
  userNameTaken: boolean;
  emailTaken: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private ApiServiceUrl= environment.ApiBaseUrl;

  constructor(private http: HttpClient) { }

  /** Public sign-up: always creates a CUSTOMER account. */
  public addUser(signUp: SignUp): Observable<string>{
    return this.http.post(`${this.ApiServiceUrl}/api/auth/signup`, signUp, {responseType: 'text'})
  }

  public checkAvailability(check: {userName?: string, email?: string}): Observable<Availability>{
    return this.http.get<Availability>(`${this.ApiServiceUrl}/api/auth/check-availability`, {params: {...check}})
  }
}
