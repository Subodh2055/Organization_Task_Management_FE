import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import {
  CATEGORIES,
  Clarification,
  ClarificationCategory,
  ClarificationPriority,
  ClarificationScope,
  ClarificationStatus,
  PRIORITIES,
  label,
} from '../../../core/models/clarification.model';
import { Project } from '../../../core/models/project.model';
import { ClarificationService } from '../../../core/services/clarification.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge.component';
import { LabelPipe } from '../../../shared/pipes/label.pipe';

type StatusFilter = ClarificationStatus | 'OVERDUE';

/** One list for three views (set by the route): every clarification, asked of me, asked by me. */
@Component({
  selector: 'app-clarification-list',
  imports: [FormsModule, RouterLink, NgbPagination, DatePipe, StatusBadgeComponent, PriorityBadgeComponent, LabelPipe],
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
  /** Optional ?filter=overdue|pending|closed, e.g. from a dashboard card. */
  readonly filter = input<string>();
  /** Optional ?priority=urgent, e.g. from a dashboard card. */
  readonly priorityParam = input<string>(undefined, { alias: 'priority' });

  protected readonly pageSize = 10;
  protected readonly items = signal<Clarification[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly projects = signal<Project[]>([]);
  /** Status filter; OVERDUE means pending past its due date. */
  protected readonly status = signal<StatusFilter | null>(null);
  protected readonly projectId = signal<number | null>(null);
  protected readonly priority = signal<ClarificationPriority | null>(null);
  protected readonly category = signal<ClarificationCategory | null>(null);
  protected readonly priorities = PRIORITIES;
  protected readonly categories = CATEGORIES;
  protected readonly label = label;
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
    if (this.search() || this.status() || this.projectId() || this.priority() || this.category()) {
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
    const initial = this.filter()?.toUpperCase();
    if (initial === 'PENDING' || initial === 'CLOSED' || initial === 'OVERDUE') {
      this.status.set(initial);
    }
    const initialPriority = this.priorityParam()?.toUpperCase() as ClarificationPriority | undefined;
    if (initialPriority && PRIORITIES.includes(initialPriority)) {
      this.priority.set(initialPriority);
    }
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

  setStatus(status: StatusFilter | null): void {
    this.status.set(status);
    this.reload();
  }

  setPriority(priority: ClarificationPriority | null): void {
    this.priority.set(priority);
    this.reload();
  }

  setCategory(category: ClarificationCategory | null): void {
    this.category.set(category);
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
        status: this.status() === 'OVERDUE' ? null : (this.status() as ClarificationStatus | null),
        overdue: this.status() === 'OVERDUE',
        priority: this.priority(),
        category: this.category(),
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
