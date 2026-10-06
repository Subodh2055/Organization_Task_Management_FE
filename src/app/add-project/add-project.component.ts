import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Organization} from "../add-organization/Organization";
import {Project} from "./Project";
import {ProjectService} from "./project.service";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AddOrganizationServiceService} from "../add-organization/add-organization-service.service";
import {ToastService} from "../ToastService";
import {Alert, AlertType} from "../Alert";

/** Admin portal: list and add projects under an organization. */
@Component({
  selector: 'app-add-project',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit {

  projects: Project[] = [];
  organizationData: Organization[] = [];
  submitted: boolean = false
  saving: boolean = false
  addForm: FormGroup


  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private addOrganizationServiceService: AddOrganizationServiceService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.formMaker();
    this.getOrganizationData();
    this.getProjectData();
  }

  addProject() {
    this.submitted = true
    if (this.addForm.invalid || this.saving) {
      return;
    }
    this.saving = true;
    this.projectService.addProject(this.addForm.value).subscribe(
      response => {
        this.saving = false;
        this.submitted = false;
        this.toastService.show(new Alert(AlertType.SUCCESS, 'Project added successfully'));
        this.addForm.reset({organizationName: null, projectName: ''});
        this.getProjectData();
      },
      error => {
        this.saving = false;
        this.toastService.show(new Alert(AlertType.ERROR, 'Failed to add project'));
      })
  }

  getProjectData() {
    this.projectService.getProject().subscribe(
      response => {
        this.projects = response;
      },
      error => {
        this.toastService.show(new Alert(AlertType.ERROR, 'Failed to load projects'));
      }
    )
  }

  formMaker() {
    this.addForm = this.formBuilder.group({
      organizationName: [null, Validators.required],
      projectName: ['', Validators.required]
    });
  }

  getOrganizationData() {
    this.addOrganizationServiceService.getOrganization().subscribe(
      response => {
        this.organizationData = response;
      },
      error => {
        this.toastService.show(new Alert(AlertType.ERROR, 'Failed to load organizations'));
      }
    )
  }

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }

  invalid(name: string): boolean {
    const control = this.addFormControl[name];
    return control.invalid && (control.touched || this.submitted);
  }
}
