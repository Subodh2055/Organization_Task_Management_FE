import {Component, Input, OnInit} from '@angular/core';
import {Organization} from "../add-organization/Organization";
import {Project} from "./Project";
import {ProjectService} from "./project.service";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ObjectUtil} from "../ObjectUtil";
import {Router} from "@angular/router";
import {AddOrganizationServiceService} from "../add-organization/add-organization-service.service";

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit {

  project: Project
  projects: Project
  projectData: any
  @Input() formValue: Project
  submitted: boolean = false
  addForm: FormGroup
  organizationData: any


  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private route: Router,
    private addOrganizationServiceService: AddOrganizationServiceService,
  ) {
  }

  ngOnInit(): void {
    this.formMaker();
    if (!ObjectUtil.isEmpty(this.formValue)) {
      this.project = this.formValue;
      this.formMaker();
    }
    this.getOrganizationData();

  }

  addProject() {
    console.log("hit this", this.addForm.value);
    this.submitted = true
    if (this.addForm.invalid) {

    } else {
      this.project = this.addForm.value;
      this.projectService.addProject(this.project).subscribe(
        response => {
          console.log(response, 'response')
        })
    }
  }

  getProjectData() {
    this.projectService.getProject().subscribe(
      response => {
        console.log(response, 'projects');
        this.projects = response;
        this.projectData = response;
        console.log(this.projectData, 'project data')

      },
      error => {
        console.log(error)
      }
    )
  }

  formMaker() {
    this.addForm = this.formBuilder.group({
      organizationName: [undefined, Validators.required],
      projectName: [undefined, Validators.required]

    });
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

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }
}
