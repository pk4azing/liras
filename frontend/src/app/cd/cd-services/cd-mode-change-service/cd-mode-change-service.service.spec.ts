import { TestBed } from '@angular/core/testing';

import { CdModeChangeServiceService } from './cd-mode-change-service.service';

describe('CdModeChangeServiceService', () => {
  let service: CdModeChangeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdModeChangeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
