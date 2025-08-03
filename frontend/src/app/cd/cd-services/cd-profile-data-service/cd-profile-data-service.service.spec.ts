import { TestBed } from '@angular/core/testing';

import { CdProfileDataServiceService } from './cd-profile-data-service.service';

describe('CdProfileDataServiceService', () => {
  let service: CdProfileDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdProfileDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
