import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddOrganizationComponent} from "./add-organization/add-organization.component";
import {AddProjectComponent} from "./add-project/add-project.component";
import {SignupComponent} from "./signup/signup.component";
import {LoginComponent} from "./login/login.component";
import {RequestClarificationComponent} from "./request-clarification/request-clarification.component";
import {ClarificationListComponent} from "./clarification-list/clarification-list.component";
import {HomeComponent} from "./home/home.component";
import {PortalComponent} from "./portal/portal.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {UsersComponent} from "./users/users.component";
import {authGuard, guestGuard} from "./core/auth.guard";

// Staff and customers get the same pages: each sees what was asked of them and what they asked.
const memberPortalPages: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'assigned', component: ClarificationListComponent, data: {scope: 'assigned'}},
  {path: 'requests', component: ClarificationListComponent, data: {scope: 'requested'}},
  {path: 'new-request', component: RequestClarificationComponent},
];

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'signIn',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'signUp',
    component: SignupComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'admin',
    component: PortalComponent,
    canActivate: [authGuard],
    data: {roles: ['ADMIN']},
    children: [
      {path: '', component: DashboardComponent},
      {path: 'organizations', component: AddOrganizationComponent},
      {path: 'projects', component: AddProjectComponent},
      {path: 'users', component: UsersComponent},
      {path: 'clarifications', component: ClarificationListComponent, data: {scope: 'all'}},
    ]
  },
  {
    path: 'staff',
    component: PortalComponent,
    canActivate: [authGuard],
    data: {roles: ['STAFF']},
    children: memberPortalPages
  },
  {
    path: 'customer',
    component: PortalComponent,
    canActivate: [authGuard],
    data: {roles: ['CUSTOMER']},
    children: memberPortalPages
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
