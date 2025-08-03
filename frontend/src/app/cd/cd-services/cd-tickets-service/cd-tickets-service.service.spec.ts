import { TestBed } from '@angular/core/testing';

import { CdTicketsServiceService } from './cd-tickets-service.service';

describe('CdTicketsServiceService', () => {
  let service: CdTicketsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdTicketsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
