import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Organization } from '../../../core/models/organization.model';
import { AccountService } from '../../../core/services/account.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';

const MOBILE = /^\+?[0-9 -]{7,20}$/;

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirmPassword')?.value ? null : { passwordMismatch: true };
}

/** Public registration: always creates a CUSTOMER account. */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  private readonly account = inject(AccountService);
  private readonly organizationService = inject(OrganizationService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly organizations = signal<Organization[]>([]);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly userNameTaken = signal(false);
  protected readonly emailTaken = signal(false);

  protected readonly form = inject(FormBuilder).group(
    {
      fullName: ['', Validators.required],
      designation: ['', Validators.required],
      organizationId: [null as number | null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(MOBILE)]],
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    this.organizationService.list().subscribe({
      next: organizations => this.organizations.set(organizations),
      error: error => this.toast.error(errorMessage(error, 'Failed to load organizations')),
    });
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name)!;
    return control.invalid && (control.touched || this.submitted());
  }

  protected get passwordMismatch(): boolean {
    const confirm = this.form.controls.confirmPassword;
    return this.form.hasError('passwordMismatch') && (confirm.touched || this.submitted());
  }

  checkUserName(): void {
    const userName = this.form.controls.userName.value?.trim();
    if (userName) {
      this.account.availability({ userName }).subscribe(result => this.userNameTaken.set(result.userNameTaken));
    }
  }

  checkEmail(): void {
    const email = this.form.controls.email.value?.trim();
    if (email && this.form.controls.email.valid) {
      this.account.availability({ email }).subscribe(result => this.emailTaken.set(result.emailTaken));
    }
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.account
      .register({
        fullName: value.fullName!,
        designation: value.designation!,
        organizationId: value.organizationId!,
        email: value.email!,
        mobile: value.mobile!,
        userName: value.userName!,
        password: value.password!,
        confirmPassword: value.confirmPassword!,
      })
      .subscribe({
        next: () => {
          this.toast.success('Account created. You can now sign in.');
          this.router.navigate(['/login']);
        },
        error: error => {
          this.saving.set(false);
          this.toast.error(errorMessage(error, 'Failed to create the account'));
        },
      });
  }
}
