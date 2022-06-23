import {Component, Input, OnInit} from '@angular/core';
import {AddOrganizationServiceService} from "./add-organization-service.service";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Organization} from "./Organization";
import {ObjectUtil} from "../ObjectUtil";


@Component({
  selector: 'app-add-organization',
  templateUrl: './add-organization.component.html',
  styleUrls: ['./add-organization.component.scss']
})
export class AddOrganizationComponent implements OnInit {
  organization: Organization;
  organizations: Organization[];
  organizationData: any
  @Input() formValue: Organization
  submitted:boolean = false
  organizationName: any
  addForm: FormGroup
  constructor(
    private addOrganizationServiceService: AddOrganizationServiceService,
    private formBuilder: FormBuilder,
    private route: Router,

  ) {}

  ngOnInit(): void {

    this.formMaker();
    if (!ObjectUtil.isEmpty(this.formValue)) {
      this.organization = this.formValue;
      this.formMaker();
    }
  }

  getOrganizationData() {
    this.addOrganizationServiceService.getOrganization().subscribe(
      response => {
        this.organizations = response;
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
      organizationName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")],
      website: [''],
    })

  }

  addOrganization() {
    this.submitted = true;
    console.log("kjadshfkjhadsfkjadshfkjhasdkfjhasdfkjhasdfkjashdfkjashdkfjhasdkfjashdkfj")
    if (this.addForm.invalid) {
      // this.submitted = false
    } else {
      this.addOrganizationServiceService.addOrganization(this.addForm.value).subscribe(
        response => {
          console.log(response, 'response')
        })
    }
  }

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }
}
