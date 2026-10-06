import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AddOrganizationServiceService} from "./add-organization-service.service";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Organization} from "./Organization";
import {ToastService} from "../ToastService";
import {Alert, AlertType} from "../Alert";

/** Admin portal: list and add organizations. */
@Component({
  selector: 'app-add-organization',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './add-organization.component.html',
  styleUrls: ['./add-organization.component.scss']
})
export class AddOrganizationComponent implements OnInit {
  organizations: Organization[] = [];
  submitted: boolean = false
  saving: boolean = false
  addForm: FormGroup

  constructor(
    private addOrganizationServiceService: AddOrganizationServiceService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.formMaker();
    this.getOrganizationData();
  }

  getOrganizationData() {
    this.addOrganizationServiceService.getOrganization().subscribe(
      response => {
        this.organizations = response;
      },
      error => {
        this.toastService.show(new Alert(AlertType.ERROR, 'Failed to load organizations'));
      }
    )
  }

  private formMaker() {
    this.addForm = this.formBuilder.group({
      organizationName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      website: [''],
    })

  }

  addOrganization() {
    this.submitted = true;
    if (this.addForm.invalid || this.saving) {
      return;
    }
    this.saving = true;
    this.addOrganizationServiceService.addOrganization(this.addForm.value).subscribe(
      response => {
        this.saving = false;
        this.submitted = false;
        this.toastService.show(new Alert(AlertType.SUCCESS, 'Organization added successfully'));
        this.addForm.reset({organizationName: '', address: '', phone: '', email: '', website: ''});
        this.getOrganizationData();
      },
      error => {
        this.saving = false;
        this.toastService.show(new Alert(AlertType.ERROR, 'Failed to add organization'));
      })
  }

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }

  invalid(name: string): boolean {
    const control = this.addFormControl[name];
    return control.invalid && (control.touched || this.submitted);
  }
}
