import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Project } from '../../../core/models/project.model';
import { User, UserSummary } from '../../../core/models/user.model';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { errorMessage } from '../../../core/utils/api-error';

/**
 * Admin: who works on a project. A project with staff members only lets those staff use it
 * (likewise for customers); with none of a role, that role is open to everyone eligible.
 */
@Component({
  selector: 'app-project-members',
  imports: [FormsModule],
  templateUrl: './project-members.component.html',
})
export class ProjectMembersComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  readonly project = input.required<Project>();

  protected readonly members = signal<UserSummary[]>([]);
  protected readonly eligible = signal<User[]>([]);
  protected readonly selected = signal<number | null>(null);
  protected readonly busy = signal(false);

  protected readonly staffMembers = computed(() => this.members().filter(m => m.role === 'STAFF'));
  protected readonly customerMembers = computed(() => this.members().filter(m => m.role === 'CUSTOMER'));
  /** Active staff, and active customers of the project's organization, who are not members yet. */
  protected readonly candidates = computed(() => {
    const memberIds = new Set(this.members().map(m => m.id));
    return this.eligible().filter(user => !memberIds.has(user.id));
  });

  ngOnInit(): void {
    this.projectService.members(this.project().id).subscribe({
      next: members => this.members.set(members),
      error: error => this.toast.error(errorMessage(error, 'Failed to load members')),
    });
    forkJoin([
      this.userService.search({ role: 'STAFF', page: 0, size: 500 }),
      this.userService.search({ role: 'CUSTOMER', page: 0, size: 500 }),
    ]).subscribe({
      next: ([staff, customers]) => {
        const orgId = this.project().organization.id;
        this.eligible.set([
          ...staff.content.filter(u => u.active),
          ...customers.content.filter(u => u.active && u.organization?.id === orgId),
        ]);
      },
      error: error => this.toast.error(errorMessage(error, 'Failed to load users')),
    });
  }

  add(): void {
    const userId = this.selected();
    if (!userId || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.projectService.addMember(this.project().id, userId).subscribe({
      next: members => {
        this.busy.set(false);
        this.selected.set(null);
        this.members.set(members);
      },
      error: error => {
        this.busy.set(false);
        this.toast.error(errorMessage(error, 'Could not add the member'));
      },
    });
  }

  remove(member: UserSummary): void {
    this.busy.set(true);
    this.projectService.removeMember(this.project().id, member.id).subscribe({
      next: members => {
        this.busy.set(false);
        this.members.set(members);
      },
      error: error => {
        this.busy.set(false);
        this.toast.error(errorMessage(error, 'Could not remove the member'));
      },
    });
  }
}
