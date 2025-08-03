import { TestBed } from '@angular/core/testing';

import { CcdReportUploadServiceService } from './ccd-report-upload-service.service';

describe('CcdReportUploadServiceService', () => {
  let service: CcdReportUploadServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcdReportUploadServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
