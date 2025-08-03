import { TestBed } from '@angular/core/testing';

import { CcdActivityDataServiceService } from './ccd-activity-data-service.service';

describe('CcdActivityDataServiceService', () => {
  let service: CcdActivityDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcdActivityDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
