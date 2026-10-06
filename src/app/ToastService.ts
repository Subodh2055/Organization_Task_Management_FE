import {Injectable} from '@angular/core';
import {Alert, AlertType} from "./Alert";

export interface Toast {
  message: string;
  classes: string;
  delay: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: Toast[] = [];

  public show(alert: Alert) {
    this.toasts.push({message: alert.message, classes: this.getClasses(alert.type), delay: 6000});
  }

  public remove(toast: Toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  private getClasses(type: AlertType): string {
    switch (type) {
      case AlertType.SUCCESS:
        return 'bg-success text-white';
      case AlertType.ERROR:
      case AlertType.DANGER:
        return 'bg-danger text-white';
      case AlertType.WARNING:
        return 'bg-warning text-dark';
      case AlertType.INFO:
        return 'bg-info text-dark';
      default:
        return 'bg-primary text-white';
    }
  }
}
