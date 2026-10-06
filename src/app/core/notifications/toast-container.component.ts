import { Component, inject } from '@angular/core';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';

import { ToastService, ToastType } from './toast.service';

const CLASSES: Record<ToastType, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  warning: 'bg-warning text-dark',
  info: 'bg-info text-dark',
};

@Component({
  selector: 'app-toast-container',
  imports: [NgbToast],
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <ngb-toast [class]="classes[toast.type]" [autohide]="true" [delay]="6000" (hidden)="toastService.remove(toast.id)">
        {{ toast.message }}
      </ngb-toast>
    }
  `,
  styles: `
    :host {
      position: fixed;
      top: 0;
      right: 0;
      margin: 0.5em;
      z-index: 1200;
    }
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly classes = CLASSES;
}
