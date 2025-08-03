import { TestBed } from '@angular/core/testing';

import { CdClientActivityServiceService } from './cd-client-activity-service.service';

describe('CdClientActivityServiceService', () => {
  let service: CdClientActivityServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdClientActivityServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
