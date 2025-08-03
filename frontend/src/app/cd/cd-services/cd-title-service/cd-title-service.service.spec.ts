import { TestBed } from '@angular/core/testing';

import { CdTitleServiceService } from './cd-title-service.service';

describe('CdTitleServiceService', () => {
  let service: CdTitleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdTitleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
