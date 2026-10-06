import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Where to go after login (set by the auth guard), e.g. a link from a notification email. */
  readonly returnUrl = input<string>();

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected invalid(name: 'username' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.loading()) {
      return;
    }
    this.loading.set(true);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: response => {
        this.toast.success(`Welcome, ${response.user.fullName}`);
        const home = this.auth.homeUrl();
        const target = this.returnUrl()?.startsWith(home) ? this.returnUrl()! : home;
        this.router.navigateByUrl(target);
      },
      error: error => {
        this.loading.set(false);
        this.toast.error(errorMessage(error, 'Invalid username or password'));
      },
    });
  }
}
