import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Forgot Password</h1>
        @if (sentMessage(); as message) {
          <p>{{ message }}</p>
          <p class="mb-0">The link is valid for one hour. <a routerLink="/login">Back to sign in</a></p>
        } @else {
          <p>Enter the email address of your account and we will send you a link to choose a new password.</p>
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="mb-4">
              <label for="email" class="form-label">Email</label>
              <input id="email" type="email" class="form-control" formControlName="email" autocomplete="email"
                     [class.is-invalid]="form.controls.email.invalid && (form.controls.email.touched || submitted())">
              <div class="invalid-feedback">A valid email is required.</div>
            </div>
            <button type="submit" class="btn btn-warning w-100" [disabled]="sending()">
              {{ sending() ? 'Sending...' : 'Send reset link' }}
            </button>
          </form>
          <p class="mt-3 mb-0"><a routerLink="/login">Back to sign in</a></p>
        }
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly account = inject(AccountService);
  private readonly toast = inject(ToastService);

  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly sentMessage = signal<string | null>(null);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.account.forgotPassword(this.form.getRawValue().email).subscribe({
      next: response => this.sentMessage.set(response.message),
      error: error => {
        this.sending.set(false);
        this.toast.error(errorMessage(error, 'Could not send the reset link'));
      },
    });
  }
}
