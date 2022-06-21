import { TestBed } from '@angular/core/testing';

import { AddOrganizationServiceService } from './add-organization-service.service';

describe('AddOrganizationServiceService', () => {
  let service: AddOrganizationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddOrganizationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
