import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ClarificationAttachment, ClarificationDetail } from '../../../core/models/clarification.model';
import { ClarificationService } from '../../../core/services/clarification.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';
import { saveBlob } from '../../../core/utils/download';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** One clarification: the question, its answer, the comment thread and attached files. */
@Component({
  selector: 'app-clarification-detail',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, StatusBadgeComponent, FileSizePipe],
  templateUrl: './clarification-detail.component.html',
})
export class ClarificationDetailComponent {
  private readonly clarificationService = inject(ClarificationService);
  private readonly toast = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly auth = inject(AuthService);

  /** Route parameter. */
  readonly id = input.required<string>();

  protected readonly detail = signal<ClarificationDetail | null>(null);
  protected readonly notFound = signal<string | null>(null);
  protected readonly answering = signal(false);
  protected readonly commenting = signal(false);
  protected readonly uploading = signal(false);

  protected readonly answerForm = this.formBuilder.nonNullable.group({ answer: ['', Validators.required] });
  protected readonly commentForm = this.formBuilder.nonNullable.group({ body: ['', Validators.required] });

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
