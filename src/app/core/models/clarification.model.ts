import { Project } from './project.model';
import { UserSummary } from './user.model';

export type ClarificationStatus = 'PENDING' | 'CLOSED';

/** ALL: every clarification (admin). ASSIGNED: asked of me. REQUESTED: asked by me. */
export type ClarificationScope = 'ALL' | 'ASSIGNED' | 'REQUESTED';

export interface Clarification {
  id: number;
  subject: string;
  description: string;
  project: Project;
  requestedBy: UserSummary;
  requestedTo: UserSummary;
  status: ClarificationStatus;
  expectedClosureDate: string | null;
  emailReference: string | null;
  answer: string | null;
  answeredBy: UserSummary | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClarificationComment {
  id: number;
  body: string;
  author: UserSummary;
  createdAt: string;
}

export interface ClarificationAttachment {
  id: number;
  fileName: string;
  contentType: string | null;
  size: number;
  uploadedBy: UserSummary;
  createdAt: string;
}

export interface ClarificationDetail {
  clarification: Clarification;
  comments: ClarificationComment[];
  attachments: ClarificationAttachment[];
  canAnswer: boolean;
  canParticipate: boolean;
}

export interface CreateClarificationRequest {
  projectId: number;
  requestedToId: number;
  subject: string;
  description: string;
  expectedClosureDate: string | null;
  emailReference: string | null;
}

export interface ClarificationQuery {
  scope: ClarificationScope;
  status?: ClarificationStatus | null;
  projectId?: number | null;
  search?: string | null;
  /** Zero-based page number. */
  page: number;
  size: number;
}
