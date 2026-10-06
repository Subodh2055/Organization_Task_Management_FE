/** A page of results from the API (page numbers start at 0). */
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MessageResponse {
  message: string;
}

export interface Dashboard {
  counts: Record<string, number>;
}
