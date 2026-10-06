import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime } from 'rxjs';

import { Organization } from '../../../core/models/organization.model';
import { ROLES, Role, User } from '../../../core/models/user.model';
import { OrganizationService } from '../../../core/services/organization.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';

const MOBILE = /^\+?[0-9 -]{7,20}$/;

/** Admin: search users, create staff/customer/admin accounts, activate and deactivate them. */
@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, NgbPagination, DatePipe],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly organizationService = inject(OrganizationService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  protected readonly roles = ROLES;
  protected readonly pageSize = 10;
  protected readonly users = signal<User[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly roleFilter = signal<Role | null>(null);
  protected readonly search = signal('');
  protected readonly loading = signal(true);
  protected readonly organizations = signal<Organization[]>([]);
  protected readonly showForm = signal(false);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  private readonly searchChanges = new Subject<string>();

  protected readonly form = inject(FormBuilder).group({
    role: ['STAFF' as Role, Validators.required],
    fullName: ['', Validators.required],
    designation: ['', Validators.required],
    organizationId: [null as number | null],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern(MOBILE)]],
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.organizationService.list().subscribe({
      next: organizations => this.organizations.set(organizations),
      error: error => this.toast.error(errorMessage(error, 'Failed to load organizations')),
    });
    this.searchChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.search.set(value);
      this.page.set(1);
      this.load();
    });
    this.load();
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name)!;
    return control.invalid && (control.touched || this.submitted());
  }

  /** Customers must belong to an organization. */
  protected get organizationMissing(): boolean {
    return this.form.controls.role.value === 'CUSTOMER' && !this.form.controls.organizationId.value
      && (this.form.controls.organizationId.touched || this.submitted());
  }

  onSearch(value: string): void {
    this.searchChanges.next(value);
  }

  filterRole(role: Role | null): void {
    this.roleFilter.set(role);
    this.page.set(1);
    this.load();
  }

  onPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userService
      .search({ role: this.roleFilter(), search: this.search(), page: this.page() - 1, size: this.pageSize })
      .subscribe({
        next: result => {
          this.users.set(result.content);
          this.total.set(result.totalElements);
          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);
          this.toast.error(errorMessage(error, 'Failed to load users'));
        },
      });
  }

  create(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.organizationMissing || this.saving()) {
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.userService
      .create({
        role: value.role!,
        fullName: value.fullName!,
        designation: value.designation!,
        organizationId: value.organizationId,
        email: value.email!,
        mobile: value.mobile!,
        userName: value.userName!,
        password: value.password!,
      })
      .subscribe({
        next: user => {
          this.saving.set(false);
          this.submitted.set(false);
          this.form.reset({ role: value.role, organizationId: null });
          this.toast.success(`${user.role} account ${user.userName} created`);
          this.load();
        },
        error: error => {
          this.saving.set(false);
          this.toast.error(errorMessage(error, 'Failed to create the user'));
        },
      });
  }

  toggleActive(user: User): void {
    this.userService.setActive(user.id, !user.active).subscribe({
      next: updated => {
        this.users.update(users => users.map(u => (u.id === updated.id ? updated : u)));
        this.toast.success(`${updated.userName} ${updated.active ? 'activated' : 'deactivated'}`);
      },
      error: error => this.toast.error(errorMessage(error, 'Could not change the account status')),
    });
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
}
