import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddOrganizationComponent} from "./add-organization/add-organization.component";
import {AddProjectComponent} from "./add-project/add-project.component";
import {SignupComponent} from "./signup/signup.component";
import {LoginComponent} from "./login/login.component";
import {RequestClarificationComponent} from "./request-clarification/request-clarification.component";
import {ClarificationTableComponent} from "./clarification-table/clarification-table.component";

const routes: Routes = [
  {
    path: 'add-organization',
    component: AddOrganizationComponent
  },
  {
    path: 'add-project',
    component: AddProjectComponent
  },
  {
    path: 'signUp',
    component: SignupComponent
  },
  {
    path: 'signIn',
    component: LoginComponent
  },
  {
    path: 'request-clarification',
    component: RequestClarificationComponent
  },
  {
    path: 'clarification-Table',
    component: ClarificationTableComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
