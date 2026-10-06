import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { Clarification, ClarificationScope, ClarificationStatus } from '../../../core/models/clarification.model';
import { Project } from '../../../core/models/project.model';
import { ClarificationService } from '../../../core/services/clarification.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

/** One list for three views (set by the route): every clarification, asked of me, asked by me. */
@Component({
  selector: 'app-clarification-list',
  imports: [FormsModule, RouterLink, NgbPagination, DatePipe, StatusBadgeComponent],
  templateUrl: './clarification-list.component.html',
  styles: `.search-box { min-width: 260px; max-width: 360px; }`,
})
export class ClarificationListComponent implements OnInit {
  private readonly clarificationService = inject(ClarificationService);
  private readonly projectService = inject(ProjectService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  /** From the route's data. */
  readonly scope = input<ClarificationScope>('ASSIGNED');

  protected readonly pageSize = 10;
  protected readonly items = signal<Clarification[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly projects = signal<Project[]>([]);
  protected readonly status = signal<ClarificationStatus | null>(null);
  protected readonly projectId = signal<number | null>(null);
  protected readonly search = signal('');
  private readonly searchChanges = new Subject<string>();

  protected readonly title = computed(() => {
    switch (this.scope()) {
      case 'ALL':
        return 'All Clarifications';
      case 'REQUESTED':
        return 'My Requests';
      default:
        return 'Assigned to Me';
    }
  });

  protected readonly emptyText = computed(() => {
    if (this.search() || this.status() || this.projectId()) {
      return 'No clarifications match these filters.';
    }
    switch (this.scope()) {
      case 'ALL':
        return 'No clarifications have been raised yet.';
      case 'REQUESTED':
        return 'You have not raised any clarifications yet.';
      default:
        return 'Nothing has been asked of you yet.';
    }
  });

  ngOnInit(): void {
    this.projectService.list().subscribe({
      next: projects => this.projects.set(projects),
      error: error => this.toast.error(errorMessage(error, 'Failed to load projects')),
    });
    this.searchChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.search.set(value);
      this.reload();
    });
    this.load();
  }

  onSearch(value: string): void {
    this.searchChanges.next(value);
  }

  setStatus(status: ClarificationStatus | null): void {
    this.status.set(status);
    this.reload();
  }

  setProject(projectId: number | null): void {
    this.projectId.set(projectId);
    this.reload();
  }

  onPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  open(clarification: Clarification): void {
    this.router.navigate([this.auth.homeUrl(), 'clarifications', clarification.id]);
  }

  /** Filters changed: back to the first page. */
  private reload(): void {
    this.page.set(1);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.clarificationService
      .search({
        scope: this.scope(),
        status: this.status(),
        projectId: this.projectId(),
        search: this.search(),
        page: this.page() - 1,
        size: this.pageSize,
      })
      .subscribe({
        next: result => {
          this.items.set(result.content);
          this.total.set(result.totalElements);
          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);
          this.toast.error(errorMessage(error, 'Failed to load clarifications'));
        },
      });
  }
}
