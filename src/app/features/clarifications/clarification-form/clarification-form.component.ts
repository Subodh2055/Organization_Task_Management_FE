import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, concat, of, toArray } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { CATEGORIES, ClarificationCategory, ClarificationPriority, PRIORITIES, label } from '../../../core/models/clarification.model';
import { Project } from '../../../core/models/project.model';
import { UserSummary } from '../../../core/models/user.model';
import { ClarificationService } from '../../../core/services/clarification.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** New clarification: staff ask customers of the project's organization; customers ask staff. */
@Component({
  selector: 'app-clarification-form',
  imports: [ReactiveFormsModule, FileSizePipe],
  templateUrl: './clarification-form.component.html',
})
export class ClarificationFormComponent implements OnInit {
  private readonly clarificationService = inject(ClarificationService);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly projects = signal<Project[]>([]);
  protected readonly people = signal<UserSummary[]>([]);
  protected readonly files = signal<File[]>([]);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);

  /** "customer" for staff, "staff member" for customers. */
  protected readonly counterpart = computed(() => (this.auth.role() === 'STAFF' ? 'customer' : 'staff member'));

  protected readonly form = inject(FormBuilder).group({
    projectId: [null as number | null, Validators.required],
    requestedToId: [null as number | null, Validators.required],
    subject: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    expectedClosureDate: [''],
    emailReference: ['', Validators.email],
    priority: ['NORMAL' as ClarificationPriority],
    category: ['GENERAL' as ClarificationCategory],
  });

  protected readonly priorities = PRIORITIES;
  protected readonly categories = CATEGORIES;
  protected readonly label = label;

  ngOnInit(): void {
    this.projectService.list().subscribe({
      next: projects => this.projects.set(projects),
      error: error => this.toast.error(errorMessage(error, 'Failed to load projects')),
    });
    // Who can be asked depends on the project (its organization and members).
    this.form.controls.projectId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(projectId => {
      this.form.controls.requestedToId.reset(null);
      this.people.set([]);
      if (projectId) {
        this.loadPeople(projectId);
      }
    });
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name)!;
    return control.invalid && (control.touched || this.submitted());
  }

  private loadPeople(projectId: number | null): void {
    this.userService.assignable(projectId).subscribe({
      next: people => this.people.set(people),
      error: error => this.toast.error(errorMessage(error, 'Failed to load people')),
    });
  }

  addFiles(input: HTMLInputElement): void {
    const chosen = Array.from(input.files ?? []);
    input.value = '';
    const tooLarge = chosen.filter(file => file.size > MAX_FILE_BYTES);
    if (tooLarge.length) {
      this.toast.error(`${tooLarge.map(f => f.name).join(', ')}: too large (10 MB maximum)`);
    }
    this.files.update(files => [...files, ...chosen.filter(file => file.size <= MAX_FILE_BYTES)]);
  }

  removeFile(index: number): void {
    this.files.update(files => files.filter((_, i) => i !== index));
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.clarificationService
      .create({
        projectId: value.projectId!,
        requestedToId: value.requestedToId!,
        subject: value.subject!,
        description: value.description!,
        expectedClosureDate: value.expectedClosureDate || null,
        emailReference: value.emailReference || null,
        priority: value.priority ?? 'NORMAL',
        category: value.category ?? 'GENERAL',
      })
      .subscribe({
        next: clarification => {
          const files = this.files();
          const detailUrl = [this.auth.homeUrl(), 'clarifications', clarification.id];
          if (!files.length) {
            this.toast.success('Clarification requested');
            this.router.navigate(detailUrl);
            return;
          }
          // Upload the chosen files one after another, then open the new clarification.
          concat(...files.map(file =>
            this.clarificationService.uploadAttachment(clarification.id, file).pipe(catchError(() => of(null))),
          ))
            .pipe(toArray())
            .subscribe(results => {
              const failed = results.filter(result => result === null).length;
              if (failed) {
                this.toast.warning(`Clarification requested, but ${failed} file(s) could not be uploaded`);
              } else {
                this.toast.success('Clarification requested');
              }
              this.router.navigate(detailUrl);
            });
        },
        error: error => {
          this.saving.set(false);
          this.toast.error(errorMessage(error, 'Failed to request the clarification'));
        },
      });
  }
}
