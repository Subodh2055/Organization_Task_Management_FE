import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AddOrganizationComponent} from './add-organization/add-organization.component';
import {AddProjectComponent} from './add-project/add-project.component';
import {SignupComponent} from './signup/signup.component';
import {LoginComponent} from './login/login.component';
import {RequestClarificationComponent} from './request-clarification/request-clarification.component';
import {ReactiveFormsModule} from "@angular/forms";
import {provideHttpClient, withInterceptors, withInterceptorsFromDi, withXhr} from "@angular/common/http";
import {MatSliderModule} from "@angular/material/slider";
import {NgxPaginationModule} from "ngx-pagination";
import { ClarificationListComponent } from './clarification-list/clarification-list.component';
import { HomeComponent } from './home/home.component';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import { PortalComponent } from './portal/portal.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { authInterceptor } from './core/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    AddOrganizationComponent,
    AddProjectComponent,
    SignupComponent,
    LoginComponent,
    RequestClarificationComponent,
    ClarificationListComponent,
    HomeComponent,
    ToastContainerComponent,
    PortalComponent,
    DashboardComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    MatSliderModule,
    NgxPaginationModule
  ],
  providers: [
    provideHttpClient(withXhr(), withInterceptorsFromDi(), withInterceptors([authInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
