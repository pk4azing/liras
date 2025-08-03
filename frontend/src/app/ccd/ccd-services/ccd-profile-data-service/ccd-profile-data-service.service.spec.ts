import { TestBed } from '@angular/core/testing';

import { CcdProfileDataServiceService } from './ccd-profile-data-service.service';

describe('CcdProfileDataServiceService', () => {
  let service: CcdProfileDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcdProfileDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
