import { TestBed } from '@angular/core/testing';

import { CdClientReportUploadServiceService } from './cd-client-report-upload-service.service';

describe('CdClientReportUploadServiceService', () => {
  let service: CdClientReportUploadServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdClientReportUploadServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
