import { OrganizationSummary } from './organization.model';

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export const ROLES: readonly Role[] = ['ADMIN', 'STAFF', 'CUSTOMER'];

export interface User {
  id: number;
  fullName: string;
  designation: string;
  organization: OrganizationSummary | null;
  email: string;
  mobile: string;
  userName: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

/** The few user fields shown next to clarifications, comments and attachments. */
export interface UserSummary {
  id: number;
  fullName: string;
  userName: string;
  role: Role;
  organizationName: string | null;
}

export interface CreateUserRequest {
  fullName: string;
  designation: string;
  organizationId: number | null;
  email: string;
  mobile: string;
  userName: string;
  password: string;
  role: Role;
}

export interface RegisterRequest {
  fullName: string;
  designation: string;
  organizationId: number;
  email: string;
  mobile: string;
  userName: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface Availability {
  userNameTaken: boolean;
  emailTaken: boolean;
}
