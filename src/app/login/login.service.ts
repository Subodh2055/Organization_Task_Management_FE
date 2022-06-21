import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {SignUp} from "../signup/SignUp";
import {HttpClient} from "@angular/common/http";
import {Login} from "./login";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private ApiServiceUrl= environment.ApiBaseUrl;


  constructor(private http:HttpClient) { }

  public getLogin(): Observable<Login>{
    return this.http.get<Login>(`${this.ApiServiceUrl}/login/all`)
  }

  public addLogin(login: Login): Observable<Login>{
    return this.http.post<Login>(`${this.ApiServiceUrl}/api/auth/signin`, login)
  }
}
