import { TestBed } from '@angular/core/testing';

import { CdRoleManagementServiceService } from './cd-role-management-service.service';

describe('CdRoleManagementServiceService', () => {
  let service: CdRoleManagementServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdRoleManagementServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
