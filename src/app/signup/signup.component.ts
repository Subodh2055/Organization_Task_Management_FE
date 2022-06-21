import {Component, Input, OnInit} from '@angular/core';
import {Organization} from "../add-organization/Organization";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SignupService} from "./signup.service";
import {SignUp} from "./SignUp";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signUp: SignUp;
  signUps: SignUp;
  signUpData: any
  @Input() formValue: Organization
  submitted: false

  addForm: FormGroup
  constructor(
    private signupService: SignupService,
    private formBuilder: FormBuilder,


  ) { }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      fullName: [undefined, Validators.required],
      designation: [undefined, Validators.required],
      organizationName: [undefined, Validators.required],
      email: [undefined, Validators.required],
      mobile: [undefined, Validators.required],
      userName: [undefined, Validators.required],
      password: [undefined, Validators.required],
      passwordConfirm:[undefined, Validators.required],
    })
  }

  addUser() {
    if (this.addForm.invalid) {
      this.submitted = false
    } else {
      this.signupService.addUser(this.addForm.value).subscribe(
        response => {
          console.log(response, 'response')
          this.getUserData();
        })
    }
  }

  getUserData() {
    this.signupService.getUser().subscribe(
      response => {
        console.log(response, 'signUps');
        this.signUps = response;
        this.signUpData = response;
        console.log(this.signUpData, 'signUp data')

      },
      error => {
        console.log(error)
      }
    )
  }
}
