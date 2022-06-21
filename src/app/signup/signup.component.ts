import {Component, Input, OnInit} from '@angular/core';
import {Organization} from "../add-organization/Organization";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SignupService} from "./signup.service";
import {SignUp} from "./SignUp";
import {AddOrganizationServiceService} from "../add-organization/add-organization-service.service";
import {ObjectUtil} from "../ObjectUtil";

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
  organizationData: any;
  constructor(

    private signupService: SignupService,
    private formBuilder: FormBuilder,
    private addOrganizationServiceService: AddOrganizationServiceService,


  ) { }

  ngOnInit(): void {
    this.formMaker();
    if (!ObjectUtil.isEmpty(this.formValue)) {
      this.signUp = this.addForm.value;
      this.formMaker();
    }
    this.getOrganizationData();

  }

  addUser() {
    if (this.addForm.invalid) {
      this.submitted = false
    } else {
      this.signupService.addUser(this.addForm.value).subscribe(
        response => {
          console.log(response, 'response')
        })
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
}
