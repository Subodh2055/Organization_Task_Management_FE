export type NotificationType =
  | 'CLARIFICATION_REQUESTED'
  | 'CLARIFICATION_ANSWERED'
  | 'COMMENT_ADDED'
  | 'CLARIFICATION_REASSIGNED'
  | 'CLARIFICATION_REOPENED'
  | 'CLARIFICATION_UPDATED'
  | 'DUE_SOON'
  | 'OVERDUE';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  clarificationId: number | null;
  read: boolean;
  createdAt: string;
}
