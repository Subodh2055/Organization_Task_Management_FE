import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastContainerComponent } from './core/notifications/toast-container.component';
import { NavbarComponent } from './layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ToastContainerComponent],
  template: `
    <app-navbar />
    <router-outlet />
    <app-toast-container />
  `,
})
export class AppComponent {}
