import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ClarificationScope, RequestclarificationService} from "../request-clarification/requestclarification.service";
import {RequestClarification} from "../request-clarification/RequestClarification";
import {AuthService} from "../core/auth.service";
import {ToastService} from "../ToastService";
import {Alert, AlertType} from "../Alert";

/** One list for three views: every clarification (admin), assigned to me, and raised by me. */
@Component({
  selector: 'app-clarification-list',
  standalone: false,
  templateUrl: './clarification-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./clarification-list.component.scss']
})
export class ClarificationListComponent implements OnInit {
  readonly pageSize = 5;
  p: number = 1
  scope: ClarificationScope = 'assigned';
  clarificationData: RequestClarification[] = [];
  loading = true;
  saving = false;
  selected: RequestClarification | null = null;
  answerForm: FormGroup

  constructor(private clarificationService: RequestclarificationService,
              private modalService: NgbModal,
              private formBuilder: FormBuilder,
              private activatedRoute: ActivatedRoute,
              public authService: AuthService,
              private toastService: ToastService) { }


  ngOnInit(): void {
    this.scope = this.activatedRoute.snapshot.data['scope'] ?? 'assigned';
    this.answerForm = this.formBuilder.group({
      provideClarification: ['', Validators.required],
    });
    this.getAllClarification();
  }

  get title(): string {
    switch (this.scope) {
      case 'all':
        return 'All Clarifications';
      case 'requested':
        return 'My Requests';
      default:
        return 'Assigned to Me';
    }
  }

  get emptyText(): string {
    switch (this.scope) {
      case 'all':
        return 'No clarifications have been raised yet.';
      case 'requested':
        return 'You have not raised any clarifications yet.';
      default:
        return 'Nothing has been asked of you yet.';
    }
  }

  getAllClarification() {
    this.loading = true;
    this.clarificationService.getClarifications(this.scope).subscribe(
      response => {
        this.clarificationData = response;
        this.loading = false;
      },
      error => {
        this.loading = false;
        this.toastService.show(new Alert(AlertType.ERROR, 'Failed to load clarifications'));
      });
  }

  isPending(data: RequestClarification): boolean {
    return !data.clarifiedDate;
  }

  /** Only the person it was asked of can answer, and only while it is pending. */
  canAnswer(data: RequestClarification): boolean {
    return this.scope === 'assigned' && this.isPending(data) && data.requestedTo?.id === this.authService.user?.id;
  }

  open(template: any, data: RequestClarification) {
    this.selected = data;
    this.answerForm.reset({provideClarification: ''});
    this.modalService.open(template, {size: 'lg'});
  }

  updateClarification() {
    if (!this.selected || this.answerForm.invalid || this.saving) {
      this.answerForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.clarificationService.answerClarification(this.selected.id, this.answerForm.value.provideClarification).subscribe(response => {
      this.saving = false;
      this.toastService.show(new Alert(AlertType.SUCCESS, 'Clarification saved successfully'));
      this.modalService.dismissAll();
      this.getAllClarification();
    },
    error => {
      this.saving = false;
      this.toastService.show(new Alert(AlertType.ERROR, typeof error.error === 'string' && error.error ? error.error : 'Failed to save clarification'));
    })
  }
}
