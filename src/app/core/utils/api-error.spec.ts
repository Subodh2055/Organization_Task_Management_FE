import { HttpErrorResponse } from '@angular/common/http';

import { errorMessage } from './api-error';

describe('errorMessage', () => {
  it('uses the message from the API error body', () => {
    const error = new HttpErrorResponse({ status: 409, error: { message: 'Username is already taken' } });
    expect(errorMessage(error, 'fallback')).toBe('Username is already taken');
  });

  it('explains when the server cannot be reached', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(errorMessage(error, 'fallback')).toContain('Cannot reach the server');
  });

  it('falls back when there is no message', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 500, error: 'oops' }), 'fallback')).toBe('fallback');
    expect(errorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
