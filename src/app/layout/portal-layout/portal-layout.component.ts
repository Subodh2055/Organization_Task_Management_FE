import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

interface PortalLink {
  label: string;
  path: string;
  exact: boolean;
}

/** Shell for the admin, staff and customer portals: role-specific sidebar plus the routed page. */
@Component({
  selector: 'app-portal-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './portal-layout.component.html',
  styleUrl: './portal-layout.component.scss',
})
export class PortalLayoutComponent {
  protected readonly auth = inject(AuthService);

  protected readonly title = computed(() => {
    switch (this.auth.role()) {
      case 'ADMIN':
        return 'Admin Portal';
      case 'STAFF':
        return 'Staff Portal';
      default:
        return 'Customer Portal';
    }
  });

  protected readonly links = computed<PortalLink[]>(() => {
    const base = this.auth.homeUrl();
    const pages: PortalLink[] =
      this.auth.role() === 'ADMIN'
        ? [
            { label: 'Dashboard', path: base, exact: true },
            { label: 'Organizations', path: `${base}/organizations`, exact: false },
            { label: 'Projects', path: `${base}/projects`, exact: false },
            { label: 'Users', path: `${base}/users`, exact: false },
            { label: 'All Clarifications', path: `${base}/clarifications`, exact: false },
          ]
        : [
            { label: 'Dashboard', path: base, exact: true },
            { label: 'Assigned to Me', path: `${base}/assigned`, exact: false },
            { label: 'My Requests', path: `${base}/requests`, exact: false },
            { label: 'New Request', path: `${base}/new-request`, exact: false },
          ];
    return [...pages, { label: 'My Account', path: `${base}/account`, exact: false }];
  });
}
