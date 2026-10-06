import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { User } from '../../core/models/user.model';
import { AccountService } from '../../core/services/account.service';
import { ToastService } from '../../core/notifications/toast.service';
import { errorMessage } from '../../core/utils/api-error';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('newPassword')?.value === group.get('confirmPassword')?.value ? null : { passwordMismatch: true };
}

/** The current user's details and password change. */
@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  private readonly account = inject(AccountService);
  private readonly toast = inject(ToastService);

  protected readonly user = signal<User | null>(null);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    this.account.me().subscribe({
      next: user => this.user.set(user),
      error: error => this.toast.error(errorMessage(error, 'Failed to load your account')),
    });
  }

  protected invalid(name: 'currentPassword' | 'newPassword' | 'confirmPassword'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && (this.form.controls.confirmPassword.touched || this.submitted());
  }

  changePassword(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.account.changePassword(currentPassword, newPassword).subscribe({
      next: response => {
        this.saving.set(false);
        this.submitted.set(false);
        this.form.reset();
        this.toast.success(response.message);
      },
      error: error => {
        this.saving.set(false);
        this.toast.error(errorMessage(error, 'Could not change the password'));
      },
    });
  }
}
