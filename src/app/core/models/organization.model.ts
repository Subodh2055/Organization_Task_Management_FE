export interface Organization {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string | null;
}

export interface OrganizationSummary {
  id: number;
  name: string;
}

export type OrganizationRequest = Omit<Organization, 'id'>;
