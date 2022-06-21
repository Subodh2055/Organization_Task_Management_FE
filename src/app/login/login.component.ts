import {Component, Input, OnInit} from '@angular/core';
import {Organization} from "../add-organization/Organization";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SignupService} from "../signup/signup.service";
import {Login} from "./login";
import {LoginService} from "./login.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  login: Login
  logins: Login
  loginData: any
  addForm: FormGroup
  @Input() formValue: Organization
  submitted: false

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      userName: [undefined, Validators.required],
      password: [undefined, Validators.required],
    })
  }

  addLogin() {
    if (this.addForm.invalid) {
    this.submitted = false
  } else {
    this.loginService.addLogin(this.addForm.value).subscribe(
      response => {
        console.log(response, 'response')
      })
  }

  }
  getLoginData() {
    this.loginService.getLogin().subscribe(
      response => {
        console.log(response, 'logins');
        this.logins = response;
        this.loginData = response;
        console.log(this.loginData, 'login Data')

      },
      error => {
        console.log(error)
      }
    )
  }
}
