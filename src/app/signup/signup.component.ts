import {Component, Input, OnInit} from '@angular/core';
import {Organization} from "../add-organization/Organization";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SignupService} from "./signup.service";
import {SignUp} from "./SignUp";
import {AddOrganizationServiceService} from "../add-organization/add-organization-service.service";
import {ObjectUtil} from "../ObjectUtil";
import {Router} from "@angular/router";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signUp: SignUp;
  @Input() formValue: Organization
  submitted: boolean = false
  addForm: FormGroup
  organizationData: any;
  alreadyUsed = false;
  alreadyUse = false
  mail: any
  userName1: any;
  passwordConfirm: any;
  password: any;
  passwordMismatch: boolean = false;

  constructor(
    private route: Router,
    private signupService: SignupService,
    private formBuilder: FormBuilder,
    private addOrganizationServiceService: AddOrganizationServiceService,
  ) {
  }

  ngOnInit(): void {
    this.formMaker();
    if (!ObjectUtil.isEmpty(this.formValue)) {
      this.signUp = this.addForm.value;
      this.formMaker();
    }
    this.getOrganizationData();

  }

  addUser() {
    this.submitted = true
    if(this.checkPassword(this.addForm.get('password')?.value,this.addForm.get('passwordConfirm')?.value) === null){
      return;
    }
    if (this.addForm.invalid) {
      return;
    } else {
      this.signupService.addUser(this.addForm.value).subscribe(
        response => {
        });
      this.nextToSignIn();
    }
  }


  getOrganizationData() {
    this.addOrganizationServiceService.getOrganization().subscribe(
      response => {
        this.organizationData = response;
        console.log(this.organizationData, 'organization data')

      },
      error => {
        console.log(error)
      }
    )
  }

  private formMaker() {
    this.addForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      designation: ['', Validators.required],
      organizationName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])],
      mobile: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      passwordConfirm: ['', Validators.required],
    });
  }

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }

  nextToSignIn() {
    this.route.navigate(['signIn'])
  }

  getOrganizationByEmail($event: FocusEvent) {
    this.addOrganizationServiceService.getOrganizationByEmail(this.addForm.get('email')?.value).subscribe(
      response => {
        this.mail = response;
        if (this.mail !== null) {
          this.alreadyUsed = true
        } else {
          this.alreadyUsed = false;
        }

      }
    )
  }

  getByUserName(event: any) {
    this.signupService.getByUserName(event.target.value).subscribe(
      response => {
        this.userName1 = response;
        if (this.userName1 !== null) {
          this.alreadyUse = true;
        } else {
          this.alreadyUse = false;
        }
      }
    )
  }

  checkPassword(password: any, confirmPassword: any): any{
    const passwordOne = password;
    const passwordTwo = confirmPassword;
    if(passwordOne !== passwordTwo){
      this.passwordMismatch =true;
      return null;
    }

  }
}

function donotmatch(arg0: string) {
    throw new Error('Function not implemented.');
}

