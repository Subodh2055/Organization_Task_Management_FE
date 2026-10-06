import {Organization} from "../add-organization/Organization";

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface AppUser {
  id: number;
  fullName: string;
  designation: string;
  organizationName: Organization | null;
  email: string;
  mobile: string;
  userName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: AppUser;
}
