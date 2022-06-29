import {Component, Input, OnInit} from '@angular/core';
import {Organization} from "../add-organization/Organization";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SignupService} from "../signup/signup.service";
import {Login} from "./login";
import {LoginService} from "./login.service";
import {ObjectUtil} from "../ObjectUtil";
import {Router} from "@angular/router";

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
  submitted: boolean = false

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private signupService: SignupService,
    private route: Router,
  ) {
  }

  ngOnInit(): void {
    this.formMaker();
    if (!ObjectUtil.isEmpty(this.formValue)) {
      this.login = this.addForm.value;
      this.formMaker();

    }
    this.getUserData();


  }

  addLogin() {
    this.submitted = true
    if (this.addForm.invalid) {

    } else {
      this.loginService.addLogin(this.addForm.value).subscribe(
        response => {
          console.log(response, 'response')
        })
    }
    this.nextToRequestClarification();

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

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }

  private formMaker() {
    this.addForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
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
  nextToRequestClarification(){
    this.route.navigate(['request-clarification'])
  }

}
