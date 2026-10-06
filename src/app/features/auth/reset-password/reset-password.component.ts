import { Component, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('newPassword')?.value === group.get('confirmPassword')?.value ? null : { passwordMismatch: true };
}

/** Opened from the emailed link: /reset-password?token=... */
@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Choose a New Password</h1>
        @if (!token()) {
          <p>This reset link is incomplete. Request a new one.</p>
          <a routerLink="/forgot-password">Request a reset link</a>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="mb-3">
              <label for="newPassword" class="form-label">New Password</label>
              <input id="newPassword" type="password" class="form-control" formControlName="newPassword" autocomplete="new-password"
                     [class.is-invalid]="form.controls.newPassword.invalid && (form.controls.newPassword.touched || submitted())">
              <div class="invalid-feedback">At least 8 characters.</div>
            </div>
            <div class="mb-4">
              <label for="confirmPassword" class="form-label">Confirm New Password</label>
              <input id="confirmPassword" type="password" class="form-control" formControlName="confirmPassword" autocomplete="new-password"
                     [class.is-invalid]="form.hasError('passwordMismatch') && (form.controls.confirmPassword.touched || submitted())">
              <div class="invalid-feedback">Passwords don't match.</div>
            </div>
            <button type="submit" class="btn btn-warning w-100" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Set new password' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly token = input<string>();

  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.account.resetPassword(this.token()!, this.form.getRawValue().newPassword).subscribe({
      next: response => {
        // Any other session in this browser belongs to the old password.
        this.auth.logout();
        this.toast.success(response.message);
        this.router.navigate(['/login']);
      },
      error: error => {
        this.saving.set(false);
        this.toast.error(errorMessage(error, 'Could not reset the password'));
      },
    });
  }
}
