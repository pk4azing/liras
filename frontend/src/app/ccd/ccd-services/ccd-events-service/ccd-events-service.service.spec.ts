import { TestBed } from '@angular/core/testing';

import { CcdEventsServiceService } from './ccd-events-service.service';

describe('CcdEventsServiceService', () => {
  let service: CcdEventsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcdEventsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
