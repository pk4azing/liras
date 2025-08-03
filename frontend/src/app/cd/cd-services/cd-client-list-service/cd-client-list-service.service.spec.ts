import { TestBed } from '@angular/core/testing';

import { CdClientListServiceService } from './cd-client-list-service.service';

describe('CdClientListServiceService', () => {
  let service: CdClientListServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdClientListServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
