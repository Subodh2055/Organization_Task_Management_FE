import {Injectable} from '@angular/core';
import {NbComponentStatus, NbToastrService} from '@nebular/theme';
import {Alert, AlertType} from "./Alert";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private service: NbToastrService) {

  }

  public show(alert: Alert) {
    const config = {status: this.getStatus(alert.type), duration: 6000};
    this.service.show(alert.type, alert.message, config);
  }

  private getStatus(type: AlertType): NbComponentStatus {
    switch (type) {
      case AlertType.ERROR:
        return 'danger';
      case AlertType.SUCCESS:
        return AlertType.SUCCESS;
      case AlertType.WARNING:
        return AlertType.WARNING;
      case AlertType.INFO:
        return AlertType.INFO;
      default:
        return 'primary';
    }
  }
}
