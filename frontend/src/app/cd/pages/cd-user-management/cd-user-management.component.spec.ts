import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdUserManagementComponent } from './cd-user-management.component';

describe('CdUserManagementComponent', () => {
  let component: CdUserManagementComponent;
  let fixture: ComponentFixture<CdUserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdUserManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdUserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
