import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'organization_task_management';

  constructor(private route: Router,) {

  }

  routeToAddOrganization() {
    this.route.navigate(['add-organization'])
  }

  routeToAddProject() {
    this.route.navigate(['add-project'])
  }

  routeToSignUp() {
    this.route.navigate(['signUp'])
  }

  routeToLogin() {
    this.route.navigate(['signIn'])
  }

  routeToRequestClarification() {
    this.route.navigate(['request-clarification'])
  }

  routeToClarificationTable() {
    this.route.navigate(['clarification-Table'])
  }
}
