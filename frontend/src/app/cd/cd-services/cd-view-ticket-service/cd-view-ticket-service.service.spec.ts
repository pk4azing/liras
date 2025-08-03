import { TestBed } from '@angular/core/testing';

import { CdViewTicketServiceService } from './cd-view-ticket-service.service';

describe('CdViewTicketServiceService', () => {
  let service: CdViewTicketServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdViewTicketServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
