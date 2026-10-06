import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "./core/auth.service";
import {ToastService} from "./ToastService";
import {Alert, AlertType} from "./Alert";

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'organization_task_management';
  public isCollapsed = true;

  constructor(private route: Router,
              public authService: AuthService,
              private toastService: ToastService) {
  }

  logout() {
    this.authService.logout();
    this.isCollapsed = true;
    this.toastService.show(new Alert(AlertType.INFO, 'You have been signed out'));
    this.route.navigate(['signIn']);
  }
}
