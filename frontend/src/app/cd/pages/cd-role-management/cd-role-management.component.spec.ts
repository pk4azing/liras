import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRoleManagementComponent } from './cd-role-management.component';

describe('CdRoleManagementComponent', () => {
  let component: CdRoleManagementComponent;
  let fixture: ComponentFixture<CdRoleManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdRoleManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdRoleManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
