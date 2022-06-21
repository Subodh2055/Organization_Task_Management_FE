import {Component, Input, OnInit} from '@angular/core';
import {Organization} from "../add-organization/Organization";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SignupService} from "../signup/signup.service";
import {Login} from "./login";
import {LoginService} from "./login.service";
import {ObjectUtil} from "../ObjectUtil";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  login: Login
  logins: Login
  loginData: any
  signUpData: any
  addForm: FormGroup
  @Input() formValue: Organization
  submitted: false

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private signupService: SignupService,
  ) { }

  ngOnInit(): void {
    this.formMaker();
    if (!ObjectUtil.isEmpty(this.formValue)) {
      this.login = this.addForm.value;
      this.formMaker();

    }
    this.getUserData();



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

  private formMaker() {
    this.addForm = this.formBuilder.group({
      userName: [undefined, Validators.required],
      password: [undefined, Validators.required],
    })

  }

  getUserData() {
    console.log('hello')
    this.signupService.getUser().subscribe(
      response => {
        this.signUpData = response;
        console.log(this.signUpData, 'signUp data')

      },
      error => {
        console.log(error)
      }
    )
  }
}
