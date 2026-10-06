import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Organization } from '../../../core/models/organization.model';
import { Project } from '../../../core/models/project.model';
import { OrganizationService } from '../../../core/services/organization.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly organizationService = inject(OrganizationService);
  private readonly toast = inject(ToastService);

  protected readonly projects = signal<Project[]>([]);
  protected readonly organizations = signal<Organization[]>([]);
  protected readonly organizationFilter = signal<number | null>(null);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly form = inject(FormBuilder).group({
    organizationId: [null as number | null, Validators.required],
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.organizationService.list().subscribe({
      next: organizations => this.organizations.set(organizations),
      error: error => this.toast.error(errorMessage(error, 'Failed to load organizations')),
    });
    this.load();
  }

  protected invalid(name: 'organizationId' | 'name'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  filterBy(organizationId: number | null): void {
    this.organizationFilter.set(organizationId);
    this.load();
  }

  load(): void {
    this.projectService.list(this.organizationFilter()).subscribe({
      next: projects => this.projects.set(projects),
      error: error => this.toast.error(errorMessage(error, 'Failed to load projects')),
    });
  }

  create(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.projectService
      .create({ organizationId: value.organizationId!, name: value.name!, description: value.description || null })
      .subscribe({
        next: project => {
          this.saving.set(false);
          this.submitted.set(false);
          this.form.reset({ organizationId: value.organizationId, name: '', description: '' });
          this.toast.success(`Project ${project.name} added`);
          this.load();
        },
        error: error => {
          this.saving.set(false);
          this.toast.error(errorMessage(error, 'Failed to add project'));
        },
      });
  }
}
