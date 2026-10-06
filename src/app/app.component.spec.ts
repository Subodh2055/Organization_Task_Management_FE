import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('shows the navbar with sign-in links when logged out', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Organization Task Management');
    expect(text).toContain('Sign In');
    expect(text).toContain('Register');
  });
});
