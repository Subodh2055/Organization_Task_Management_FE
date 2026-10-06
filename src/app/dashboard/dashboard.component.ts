import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {forkJoin} from "rxjs";
import {AuthService} from "../core/auth.service";
import {AddOrganizationServiceService} from "../add-organization/add-organization-service.service";
import {ProjectService} from "../add-project/project.service";
import {UserService} from "../users/user.service";
import {RequestclarificationService} from "../request-clarification/requestclarification.service";
import {RequestClarification} from "../request-clarification/RequestClarification";
import {ToastService} from "../ToastService";
import {Alert, AlertType} from "../Alert";

interface StatCard {
  label: string;
  value: number;
  link?: string;
  tone: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  cards: StatCard[] = [];
  loading = true;

  constructor(
    public authService: AuthService,
    private organizationService: AddOrganizationServiceService,
    private projectService: ProjectService,
    private userService: UserService,
    private clarificationService: RequestclarificationService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    if (this.authService.role === 'ADMIN') {
      this.loadAdmin();
    } else {
      this.loadMine();
    }
  }

  private loadAdmin() {
    const base = this.authService.homeUrl();
    forkJoin({
      organizations: this.organizationService.getOrganization(),
      projects: this.projectService.getProject(),
      users: this.userService.getUsers(),
      clarifications: this.clarificationService.getRequestClarification(),
    }).subscribe(
      data => {
        const pending = data.clarifications.filter(c => !c.clarifiedDate).length;
        this.cards = [
          {label: 'Organizations', value: data.organizations.length, link: `${base}/organizations`, tone: 'primary'},
          {label: 'Projects', value: data.projects.length, link: `${base}/projects`, tone: 'primary'},
          {label: 'Staff', value: data.users.filter(u => u.role === 'STAFF').length, link: `${base}/users`, tone: 'info'},
          {label: 'Customers', value: data.users.filter(u => u.role === 'CUSTOMER').length, link: `${base}/users`, tone: 'info'},
          {label: 'Pending clarifications', value: pending, link: `${base}/clarifications`, tone: 'warning'},
          {label: 'Closed clarifications', value: data.clarifications.length - pending, link: `${base}/clarifications`, tone: 'success'},
        ];
        this.loading = false;
      },
      error => this.failed()
    );
  }

  private loadMine() {
    const base = this.authService.homeUrl();
    forkJoin({
      assigned: this.clarificationService.getMyClarifications('assigned'),
      requested: this.clarificationService.getMyClarifications('requested'),
    }).subscribe(
      data => {
        this.cards = [
          {label: 'Waiting for my answer', value: this.pending(data.assigned), link: `${base}/assigned`, tone: 'warning'},
          {label: 'Answered by me', value: data.assigned.length - this.pending(data.assigned), link: `${base}/assigned`, tone: 'success'},
          {label: 'My open requests', value: this.pending(data.requested), link: `${base}/requests`, tone: 'warning'},
          {label: 'My answered requests', value: data.requested.length - this.pending(data.requested), link: `${base}/requests`, tone: 'success'},
        ];
        this.loading = false;
      },
      error => this.failed()
    );
  }

  private pending(list: RequestClarification[]): number {
    return list.filter(c => !c.clarifiedDate).length;
  }

  private failed() {
    this.loading = false;
    this.toastService.show(new Alert(AlertType.ERROR, 'Failed to load the dashboard'));
  }
}
