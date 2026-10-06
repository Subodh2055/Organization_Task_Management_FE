import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import {
  ActivityType,
  CATEGORIES,
  ClarificationActivity,
  ClarificationAttachment,
  ClarificationCategory,
  ClarificationDetail,
  ClarificationPriority,
  PRIORITIES,
  UpdateClarificationRequest,
  label,
} from '../../../core/models/clarification.model';
import { UserSummary } from '../../../core/models/user.model';
import { ClarificationService } from '../../../core/services/clarification.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';
import { saveBlob } from '../../../core/utils/download';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge.component';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** How each history entry reads after the actor's name. */
const ACTIVITY_TEXT: Record<ActivityType, string> = {
  CREATED: 'raised this clarification',
  ANSWERED: 'answered',
  REASSIGNED: 'reassigned it',
  REOPENED: 'reopened it',
  PRIORITY_CHANGED: 'changed the priority',
  CATEGORY_CHANGED: 'changed the category',
  DUE_DATE_CHANGED: 'changed the due date',
  ATTACHMENT_ADDED: 'attached a file',
  ATTACHMENT_REMOVED: 'removed a file',
  REMINDER_SENT: 'sent a reminder',
};

/** One clarification: the question, its answer, the comment thread and attached files. */
@Component({
  selector: 'app-clarification-detail',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, StatusBadgeComponent, PriorityBadgeComponent, LabelPipe, FileSizePipe],
  templateUrl: './clarification-detail.component.html',
})
export class ClarificationDetailComponent {
  private readonly clarificationService = inject(ClarificationService);
  private readonly toast = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  /** Route parameter. */
  readonly id = input.required<string>();

  protected readonly detail = signal<ClarificationDetail | null>(null);
  protected readonly notFound = signal<string | null>(null);
  protected readonly answering = signal(false);
  protected readonly commenting = signal(false);
  protected readonly uploading = signal(false);

  protected readonly showReassign = signal(false);
  protected readonly showReopen = signal(false);
  protected readonly showEdit = signal(false);
  protected readonly savingEdit = signal(false);
  protected readonly priorities = PRIORITIES;
  protected readonly categories = CATEGORIES;
  protected readonly label = label;
  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly candidates = signal<UserSummary[]>([]);
  protected readonly reassigning = signal(false);
  protected readonly reopening = signal(false);

  protected readonly answerForm = this.formBuilder.nonNullable.group({ answer: ['', Validators.required] });
  protected readonly commentForm = this.formBuilder.nonNullable.group({ body: ['', Validators.required] });
  protected readonly reassignForm = this.formBuilder.group({
    requestedToId: [null as number | null, Validators.required],
    note: [''],
  });
  protected readonly reopenForm = this.formBuilder.nonNullable.group({ reason: ['', Validators.required] });
  protected readonly editForm = this.formBuilder.group({
    priority: ['NORMAL' as ClarificationPriority],
    category: ['GENERAL' as ClarificationCategory],
    expectedClosureDate: [''],
  });

  /** The list this clarification belongs to, for the back link. */
  protected readonly backLink = computed(() => {
    const base = this.auth.homeUrl();
    const clarification = this.detail()?.clarification;
    if (this.auth.role() === 'ADMIN') {
      return { url: `${base}/clarifications`, label: 'All Clarifications' };
    }
    return clarification?.requestedTo.id === this.auth.user()?.id
      ? { url: `${base}/assigned`, label: 'Assigned to Me' }
      : { url: `${base}/requests`, label: 'My Requests' };
  });

  constructor() {
    effect(() => this.load(Number(this.id())));
  }

  load(id: number): void {
    this.clarificationService.detail(id).subscribe({
      next: detail => {
        this.detail.set(detail);
        this.notFound.set(null);
      },
      error: error => this.notFound.set(errorMessage(error, 'This clarification could not be loaded')),
    });
  }

  answer(): void {
    const detail = this.detail();
    if (!detail || this.answerForm.invalid || this.answering()) {
      this.answerForm.markAllAsTouched();
      return;
    }
    this.answering.set(true);
    this.clarificationService.answer(detail.clarification.id, this.answerForm.getRawValue().answer).subscribe({
      next: () => {
        this.answering.set(false);
        this.toast.success('Clarification answered');
        this.load(detail.clarification.id);
      },
      error: error => {
        this.answering.set(false);
        this.toast.error(errorMessage(error, 'Could not save the answer'));
      },
    });
  }

  activityText(activity: ClarificationActivity): string {
    return ACTIVITY_TEXT[activity.type];
  }

  toggleEdit(): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }
    if (!this.showEdit()) {
      const c = detail.clarification;
      this.editForm.reset({ priority: c.priority, category: c.category, expectedClosureDate: c.expectedClosureDate ?? '' });
      // Only the fields this user may change are editable.
      if (detail.canEditClassification) {
        this.editForm.controls.priority.enable();
        this.editForm.controls.category.enable();
      } else {
        this.editForm.controls.priority.disable();
        this.editForm.controls.category.disable();
      }
      if (detail.canChangeDueDate) {
        this.editForm.controls.expectedClosureDate.enable();
      } else {
        this.editForm.controls.expectedClosureDate.disable();
      }
    }
    this.showEdit.set(!this.showEdit());
  }

  saveEdit(): void {
    const detail = this.detail();
    if (!detail || this.savingEdit()) {
      return;
    }
    const c = detail.clarification;
    const value = this.editForm.getRawValue();
    const changes: UpdateClarificationRequest = {};
    if (detail.canEditClassification && value.priority && value.priority !== c.priority) {
      changes.priority = value.priority;
    }
    if (detail.canEditClassification && value.category && value.category !== c.category) {
      changes.category = value.category;
    }
    if (detail.canChangeDueDate && (value.expectedClosureDate || null) !== c.expectedClosureDate) {
      if (value.expectedClosureDate) {
        changes.expectedClosureDate = value.expectedClosureDate;
      } else {
        changes.clearDueDate = true;
      }
    }
    if (!Object.keys(changes).length) {
      this.showEdit.set(false);
      return;
    }
    this.savingEdit.set(true);
    this.clarificationService.update(c.id, changes).subscribe({
      next: () => {
        this.savingEdit.set(false);
        this.showEdit.set(false);
        this.toast.success('Clarification updated');
        this.load(c.id);
      },
      error: error => {
        this.savingEdit.set(false);
        this.toast.error(errorMessage(error, 'Could not save the changes'));
      },
    });
  }

  toggleReassign(): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }
    if (this.showReassign()) {
      this.showReassign.set(false);
      return;
    }
    this.reassignForm.reset({ requestedToId: null, note: '' });
    this.showReassign.set(true);
    this.clarificationService.reassignCandidates(detail.clarification.id).subscribe({
      next: people => this.candidates.set(people),
      error: error => this.toast.error(errorMessage(error, 'Could not load who it can be reassigned to')),
    });
  }

  reassign(): void {
    const detail = this.detail();
    if (!detail || this.reassignForm.invalid || this.reassigning()) {
      this.reassignForm.markAllAsTouched();
      return;
    }
    const { requestedToId, note } = this.reassignForm.getRawValue();
    const me = this.auth.user();
    // The assignee hands it on and loses access; the requester and admins keep it.
    const losesAccess = this.auth.role() !== 'ADMIN' && detail.clarification.requestedBy.id !== me?.id;
    this.reassigning.set(true);
    this.clarificationService.reassign(detail.clarification.id, requestedToId!, note || null).subscribe({
      next: updated => {
        this.reassigning.set(false);
        this.showReassign.set(false);
        this.toast.success(`Reassigned to ${updated.requestedTo.fullName}`);
        if (losesAccess) {
          this.router.navigateByUrl(`${this.auth.homeUrl()}/assigned`);
        } else {
          this.load(detail.clarification.id);
        }
      },
      error: error => {
        this.reassigning.set(false);
        this.toast.error(errorMessage(error, 'Could not reassign'));
      },
    });
  }

  reopen(): void {
    const detail = this.detail();
    if (!detail || this.reopenForm.invalid || this.reopening()) {
      this.reopenForm.markAllAsTouched();
      return;
    }
    this.reopening.set(true);
    this.clarificationService.reopen(detail.clarification.id, this.reopenForm.getRawValue().reason).subscribe({
      next: () => {
        this.reopening.set(false);
        this.showReopen.set(false);
        this.reopenForm.reset();
        this.toast.success('Clarification reopened');
        this.load(detail.clarification.id);
      },
      error: error => {
        this.reopening.set(false);
        this.toast.error(errorMessage(error, 'Could not reopen'));
      },
    });
  }

  comment(): void {
    const detail = this.detail();
    if (!detail || this.commentForm.invalid || this.commenting()) {
      this.commentForm.markAllAsTouched();
      return;
    }
    this.commenting.set(true);
    this.clarificationService.addComment(detail.clarification.id, this.commentForm.getRawValue().body).subscribe({
      next: comment => {
        this.commenting.set(false);
        this.commentForm.reset();
        this.detail.update(d => (d ? { ...d, comments: [...d.comments, comment] } : d));
      },
      error: error => {
        this.commenting.set(false);
        this.toast.error(errorMessage(error, 'Could not post the comment'));
      },
    });
  }

  upload(input: HTMLInputElement): void {
    const detail = this.detail();
    const file = input.files?.[0];
    input.value = '';
    if (!detail || !file) {
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.toast.error('The file is too large (10 MB maximum)');
      return;
    }
    this.uploading.set(true);
    this.clarificationService.uploadAttachment(detail.clarification.id, file).subscribe({
      next: attachment => {
        this.uploading.set(false);
        this.toast.success(`${attachment.fileName} attached`);
        this.detail.update(d => (d ? { ...d, attachments: [...d.attachments, attachment] } : d));
      },
      error: error => {
        this.uploading.set(false);
        this.toast.error(errorMessage(error, 'Could not upload the file'));
      },
    });
  }

  download(attachment: ClarificationAttachment): void {
    const id = this.detail()!.clarification.id;
    this.clarificationService.downloadAttachment(id, attachment.id).subscribe({
      next: blob => saveBlob(blob, attachment.fileName),
      error: error => this.toast.error(errorMessage(error, 'Could not download the file')),
    });
  }

  canDelete(attachment: ClarificationAttachment): boolean {
    return this.auth.role() === 'ADMIN' || attachment.uploadedBy.id === this.auth.user()?.id;
  }

  remove(attachment: ClarificationAttachment): void {
    if (!confirm(`Delete ${attachment.fileName}?`)) {
      return;
    }
    const id = this.detail()!.clarification.id;
    this.clarificationService.deleteAttachment(id, attachment.id).subscribe({
      next: () => {
        this.toast.success(`${attachment.fileName} deleted`);
        this.detail.update(d => (d ? { ...d, attachments: d.attachments.filter(a => a.id !== attachment.id) } : d));
      },
      error: error => this.toast.error(errorMessage(error, 'Could not delete the file')),
    });
  }
}
