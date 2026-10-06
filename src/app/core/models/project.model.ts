import { OrganizationSummary } from './organization.model';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  organization: OrganizationSummary;
}

export interface ProjectRequest {
  name: string;
  description: string | null;
  organizationId: number;
}
