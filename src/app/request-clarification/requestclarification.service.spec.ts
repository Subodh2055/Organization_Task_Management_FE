import { TestBed } from '@angular/core/testing';

import { RequestclarificationService } from './requestclarification.service';

describe('RequestclarificationService', () => {
  let service: RequestclarificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestclarificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
