export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger'
}

export class Alert {
  constructor(readonly type: AlertType, readonly message: string) {
  }
}
