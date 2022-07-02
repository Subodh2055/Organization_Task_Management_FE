import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NbThemeModule, NbLayoutModule, NbCardModule} from '@nebular/theme';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {AddOrganizationComponent} from './add-organization/add-organization.component';
import {AddProjectComponent} from './add-project/add-project.component';
import {SignupComponent} from './signup/signup.component';
import {LoginComponent} from './login/login.component';
import {RequestClarificationComponent} from './request-clarification/request-clarification.component';
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {MatSliderModule} from "@angular/material/slider";
import { ClarificationTableComponent } from './clarification-table/clarification-table.component';
import {NgxPaginationModule} from "ngx-pagination";

@NgModule({
  declarations: [
    AppComponent,
    AddOrganizationComponent,
    AddProjectComponent,
    SignupComponent,
    LoginComponent,
    RequestClarificationComponent,
    ClarificationTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({name: 'default'}),
    NbLayoutModule,
    NbEvaIconsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSliderModule,
    NbCardModule,
    NgxPaginationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
