import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "./user.service";
import {AppUser, Role} from "../core/auth.models";
import {Organization} from "../add-organization/Organization";
import {AddOrganizationServiceService} from "../add-organization/add-organization-service.service";
import {ToastService} from "../ToastService";
import {Alert, AlertType} from "../Alert";

/** Admin portal: list users and create staff, customer or admin accounts. */
@Component({
  selector: 'app-users',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {

  readonly roles: Role[] = ['STAFF', 'CUSTOMER', 'ADMIN'];
  users: AppUser[] = [];
  organizationData: Organization[] = [];
  roleFilter: Role | '' = '';
  addForm: FormGroup;
  submitted = false;
  saving = false;

  constructor(
    private userService: UserService,
    private organizationService: AddOrganizationServiceService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      role: ['STAFF', Validators.required],
      fullName: ['', Validators.required],
      designation: ['', Validators.required],
      organizationName: [null],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      mobile: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });
    this.getUsers();
    this.organizationService.getOrganization().subscribe(
      response => this.organizationData = response,
      error => this.toastService.show(new Alert(AlertType.ERROR, 'Failed to load organizations'))
    );
  }

  get filteredUsers(): AppUser[] {
    return this.roleFilter ? this.users.filter(user => user.role === this.roleFilter) : this.users;
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      response => this.users = response,
      error => this.toastService.show(new Alert(AlertType.ERROR, 'Failed to load users'))
    );
  }

  addUser() {
    this.submitted = true;
    if (this.addForm.invalid || this.saving) {
      return;
    }
    this.saving = true;
    this.userService.addUser(this.addForm.value).subscribe(
      response => {
        this.saving = false;
        this.submitted = false;
        this.toastService.show(new Alert(AlertType.SUCCESS, `${response.role} account ${response.userName} created`));
        this.addForm.reset({role: this.addForm.value.role, organizationName: null, fullName: '', designation: '',
          email: '', mobile: '', userName: '', password: ''});
        this.getUsers();
      },
      error => {
        this.saving = false;
        this.toastService.show(new Alert(AlertType.ERROR, typeof error.error === 'string' && error.error ? error.error : 'Failed to create user'));
      }
    );
  }

  roleBadge(role: Role): string {
    switch (role) {
      case 'ADMIN':
        return 'text-bg-dark';
      case 'STAFF':
        return 'text-bg-primary';
      default:
        return 'text-bg-info';
    }
  }

  invalid(name: string): boolean {
    const control: AbstractControl = this.addForm.controls[name];
    return control.invalid && (control.touched || this.submitted);
  }
}
