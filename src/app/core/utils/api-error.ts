import { HttpErrorResponse } from '@angular/common/http';

/** The user-facing message from an API error ({ message } body), or the fallback. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Cannot reach the server. Check that the backend is running.';
    }
    const message = error.error?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
}
