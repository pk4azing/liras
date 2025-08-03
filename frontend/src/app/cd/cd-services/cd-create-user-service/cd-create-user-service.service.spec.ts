import { TestBed } from '@angular/core/testing';

import { CdCreateUserServiceService } from './cd-create-user-service.service';

describe('CdCreateUserServiceService', () => {
  let service: CdCreateUserServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdCreateUserServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
