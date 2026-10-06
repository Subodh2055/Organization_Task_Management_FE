import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ToastService} from "../ToastService";

@Component({
  selector: 'app-toast-container',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ngb-toast *ngFor="let toast of toastService.toasts"
               [class]="toast.classes"
               [autohide]="true"
               [delay]="toast.delay"
               (hidden)="toastService.remove(toast)">
      {{ toast.message }}
    </ngb-toast>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      right: 0;
      margin: 0.5em;
      z-index: 1200;
    }
  `]
})
export class ToastContainerComponent {

  constructor(public toastService: ToastService) {
  }
}
