import { TestBed } from '@angular/core/testing';

import { CdEventsServiceService } from './cd-events-service.service';

describe('CdEventsServiceService', () => {
  let service: CdEventsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdEventsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
