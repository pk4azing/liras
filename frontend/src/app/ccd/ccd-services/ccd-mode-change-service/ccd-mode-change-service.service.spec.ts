import { TestBed } from '@angular/core/testing';

import { CcdModeChangeServiceService } from './ccd-mode-change-service.service';

describe('CcdModeChangeServiceService', () => {
  let service: CcdModeChangeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcdModeChangeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
