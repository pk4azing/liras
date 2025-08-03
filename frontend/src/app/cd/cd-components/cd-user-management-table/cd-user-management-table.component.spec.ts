import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdUserManagementTableComponent } from './cd-user-management-table.component';

describe('CdUserManagementTableComponent', () => {
  let component: CdUserManagementTableComponent;
  let fixture: ComponentFixture<CdUserManagementTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdUserManagementTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdUserManagementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
