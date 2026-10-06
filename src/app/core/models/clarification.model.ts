import { Project } from './project.model';
import { UserSummary } from './user.model';

export type ClarificationStatus = 'PENDING' | 'CLOSED';

export type ClarificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type ClarificationCategory = 'GENERAL' | 'REQUIREMENTS' | 'TECHNICAL' | 'DESIGN' | 'BILLING' | 'TESTING' | 'OTHER';

export const PRIORITIES: readonly ClarificationPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export const CATEGORIES: readonly ClarificationCategory[] = ['GENERAL', 'REQUIREMENTS', 'TECHNICAL', 'DESIGN', 'BILLING', 'TESTING', 'OTHER'];

/** "URGENT" -> "Urgent". */
export function label(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');
}

export type ActivityType =
  | 'CREATED'
  | 'ANSWERED'
  | 'REASSIGNED'
  | 'REOPENED'
  | 'PRIORITY_CHANGED'
  | 'CATEGORY_CHANGED'
  | 'DUE_DATE_CHANGED'
  | 'ATTACHMENT_ADDED'
  | 'ATTACHMENT_REMOVED'
  | 'REMINDER_SENT';

/** A history entry; actor is null for system actions such as reminders. */
export interface ClarificationActivity {
  id: number;
  type: ActivityType;
  actor: UserSummary | null;
  details: string | null;
  createdAt: string;
}

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
  priority: ClarificationPriority;
  category: ClarificationCategory;
  expectedClosureDate: string | null;
  emailReference: string | null;
  answer: string | null;
  answeredBy: UserSummary | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Still pending after its expected closure date. */
  overdue: boolean;
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
  activities: ClarificationActivity[];
  canAnswer: boolean;
  canParticipate: boolean;
  canReassign: boolean;
  canReopen: boolean;
  /** Priority and category: requester, assignee or admin while pending. */
  canEditClassification: boolean;
  /** Due date: requester or admin while pending. */
  canChangeDueDate: boolean;
}

/** Fields left out are not changed; clearDueDate removes the due date. */
export interface UpdateClarificationRequest {
  priority?: ClarificationPriority;
  category?: ClarificationCategory;
  expectedClosureDate?: string;
  clearDueDate?: boolean;
}

export interface CreateClarificationRequest {
  projectId: number;
  requestedToId: number;
  subject: string;
  description: string;
  expectedClosureDate: string | null;
  emailReference: string | null;
  priority: ClarificationPriority;
  category: ClarificationCategory;
}

export interface ClarificationQuery {
  scope: ClarificationScope;
  status?: ClarificationStatus | null;
  /** Only pending items past their due date. */
  overdue?: boolean;
  priority?: ClarificationPriority | null;
  category?: ClarificationCategory | null;
  projectId?: number | null;
  search?: string | null;
  /** Zero-based page number. */
  page: number;
  size: number;
}
