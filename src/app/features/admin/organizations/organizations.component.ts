import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Organization } from '../../../core/models/organization.model';
import { OrganizationService } from '../../../core/services/organization.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-organizations',
  imports: [ReactiveFormsModule],
  templateUrl: './organizations.component.html',
})
export class OrganizationsComponent implements OnInit {
  private readonly organizationService = inject(OrganizationService);
  private readonly toast = inject(ToastService);

  protected readonly organizations = signal<Organization[]>([]);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    website: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name)!;
    return control.invalid && (control.touched || this.submitted());
  }

  load(): void {
    this.organizationService.list().subscribe({
      next: organizations => this.organizations.set(organizations),
      error: error => this.toast.error(errorMessage(error, 'Failed to load organizations')),
    });
  }

  create(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.organizationService.create({ ...value, website: value.website || null }).subscribe({
      next: organization => {
        this.saving.set(false);
        this.submitted.set(false);
        this.form.reset();
        this.toast.success(`Organization ${organization.name} added`);
        this.load();
      },
      error: error => {
        this.saving.set(false);
        this.toast.error(errorMessage(error, 'Failed to add organization'));
      },
    });
  }
}
