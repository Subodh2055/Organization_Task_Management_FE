import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from "../core/auth.service";

interface PortalLink {
  label: string;
  path: string;
  exact: boolean;
}

/** Shell for the admin, staff and customer portals: role-specific sidebar plus the routed page. */
@Component({
  selector: 'app-portal',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss']
})
export class PortalComponent {

  // Built once: a getter returning new objects would make *ngFor recreate the
  // routerLinkActive links on every change detection pass, which never settles.
  readonly title: string;
  readonly links: PortalLink[];

  constructor(public authService: AuthService) {
    const base = authService.homeUrl();
    switch (authService.role) {
      case 'ADMIN':
        this.title = 'Admin Portal';
        this.links = [
          {label: 'Dashboard', path: base, exact: true},
          {label: 'Organizations', path: `${base}/organizations`, exact: false},
          {label: 'Projects', path: `${base}/projects`, exact: false},
          {label: 'Users', path: `${base}/users`, exact: false},
          {label: 'All Clarifications', path: `${base}/clarifications`, exact: false},
        ];
        break;
      default:
        this.title = authService.role === 'STAFF' ? 'Staff Portal' : 'Customer Portal';
        this.links = [
          {label: 'Dashboard', path: base, exact: true},
          {label: 'Assigned to Me', path: `${base}/assigned`, exact: false},
          {label: 'My Requests', path: `${base}/requests`, exact: false},
          {label: 'New Request', path: `${base}/new-request`, exact: false},
        ];
    }
  }
}
