import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';
import { ClarificationScope } from './core/models/clarification.model';

const clarificationList = () =>
  import('./features/clarifications/clarification-list/clarification-list.component').then(m => m.ClarificationListComponent);
const clarificationDetail = () =>
  import('./features/clarifications/clarification-detail/clarification-detail.component').then(m => m.ClarificationDetailComponent);
const dashboard = () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent);
const account = () => import('./features/account/account.component').then(m => m.AccountComponent);
const scope = (value: ClarificationScope) => ({ scope: value });

// Staff and customers get the same pages: what was asked of them, what they asked, and a new request form.
const memberPages: Routes = [
  { path: '', title: 'Dashboard', loadComponent: dashboard },
  { path: 'assigned', title: 'Assigned to Me', loadComponent: clarificationList, data: scope('ASSIGNED') },
  { path: 'requests', title: 'My Requests', loadComponent: clarificationList, data: scope('REQUESTED') },
  {
    path: 'new-request',
    title: 'New Request',
    loadComponent: () =>
      import('./features/clarifications/clarification-form/clarification-form.component').then(m => m.ClarificationFormComponent),
  },
  { path: 'clarifications/:id', title: 'Clarification', loadComponent: clarificationDetail },
  { path: 'account', title: 'My Account', loadComponent: account },
];

const portal = () => import('./layout/portal-layout/portal-layout.component').then(m => m.PortalLayoutComponent);

export const routes: Routes = [
  { path: '', title: 'Organization Task Management', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  {
    path: 'login',
    title: 'Sign In',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    title: 'Create Account',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    title: 'Forgot Password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    title: 'Reset Password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'admin',
    loadComponent: portal,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', title: 'Dashboard', loadComponent: dashboard },
      {
        path: 'organizations',
        title: 'Organizations',
        loadComponent: () => import('./features/admin/organizations/organizations.component').then(m => m.OrganizationsComponent),
      },
      {
        path: 'projects',
        title: 'Projects',
        loadComponent: () => import('./features/admin/projects/projects.component').then(m => m.ProjectsComponent),
      },
      {
        path: 'users',
        title: 'Users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent),
      },
      { path: 'clarifications', title: 'All Clarifications', loadComponent: clarificationList, data: scope('ALL') },
      { path: 'clarifications/:id', title: 'Clarification', loadComponent: clarificationDetail },
      { path: 'account', title: 'My Account', loadComponent: account },
    ],
  },
  { path: 'staff', loadComponent: portal, canActivate: [authGuard], data: { roles: ['STAFF'] }, children: memberPages },
  { path: 'customer', loadComponent: portal, canActivate: [authGuard], data: { roles: ['CUSTOMER'] }, children: memberPages },
  // Old URLs from before the restructure.
  { path: 'signIn', redirectTo: 'login' },
  { path: 'signUp', redirectTo: 'register' },
  { path: '**', redirectTo: '' },
];
