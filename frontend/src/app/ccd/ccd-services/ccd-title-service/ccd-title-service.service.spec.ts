import { TestBed } from '@angular/core/testing';

import { CcdTitleServiceService } from './ccd-title-service.service';

describe('CcdTitleServiceService', () => {
  let service: CcdTitleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcdTitleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
