import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Organization} from "../add-organization/Organization";
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
    return this.http.get<SignUp>(`${this.ApiServiceUrl}/signUp/all`)
  }

  public addUser(signUp: SignUp): Observable<SignUp>{
    return this.http.post<SignUp>(`${this.ApiServiceUrl}/signUp/add`, signUp)
  }
}
